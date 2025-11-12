package com.ring.service.impl;

import com.google.common.base.Strings;
import com.ring.common.AppConstants;
import com.ring.dto.response.CloudinaryResponse;
import com.ring.exception.HttpResponseException;
import com.ring.exception.ImageUploadException;
import com.ring.exception.ResourceNotFoundException;
import com.ring.model.entity.Image;
import com.ring.repository.ImageRepository;
import com.ring.service.CloudinaryService;
import com.ring.service.ImageService;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service class for managing images from cloudinary.
 */
@RequiredArgsConstructor
@Service
public class ImageServiceImpl implements ImageService {

    private final ImageRepository imageRepo;
    private final CloudinaryService cloudinaryService;
    private final MessageService messageService;

    public List<Image> getAllImages() {
        return imageRepo.findAll();
    }

    public Image replace(MultipartFile file, Long id) {

        this.isFileAllowed(file);

        try {
            if (file.isEmpty()) {

                var errorMsg = messageService.getMessage("exception.image.not.found");
                throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                        AppConstants.INVALID_ARGUMENT,
                        errorMsg);
            }
            Image image = imageRepo.findById(id)
                    .orElseThrow(() -> {
                        var errorMsg = messageService.getMessage("exception.not.found",
                                new Object[] { new DefaultMessageSourceResolvable("label.image") });
                        return new ResourceNotFoundException(errorMsg);
                    });

            byte[] bytes = writeImage(file);

            CloudinaryResponse uploaded = cloudinaryService.replace(bytes, image.getPublicId());
            image.setPublicId(uploaded.getPublicId());
            image.setUrl(uploaded.getUrl());

            if (uploaded.getUrl() == null) {

                var errorMsg = messageService.getMessage("exception.image.replace");
                throw new ImageUploadException(errorMsg);
            }
            return image;
        } catch (IOException e) {

            var errorMsg = messageService.getMessage("exception.image.replace");
            throw new ImageUploadException(errorMsg);
        }
    }

    public Image upload(MultipartFile file, String folderName) {

        this.isFileAllowed(file);
        String fileName = FileUploadUtil.getFileName(file);

        try {
            if (file.isEmpty()) {
                throw new HttpResponseException(HttpStatus.BAD_REQUEST, "File not found!");
            }

            byte[] bytes = writeImage(file);

            CloudinaryResponse uploaded = cloudinaryService.upload(bytes,
                    FilenameUtils.getBaseName(fileName),
                    folderName);
            Image image = Image.builder()
                    .name(fileName)
                    .publicId(uploaded.getPublicId())
                    .url(uploaded.getUrl())
                    .type(file.getContentType())
                    .build();
            if (image.getUrl() == null) {

                var errorMsg = messageService.getMessage("exception.image.upload");
                throw new ImageUploadException(errorMsg);
            }

            return imageRepo.save(image);
        } catch (IOException e) {

            var errorMsg = messageService.getMessage("exception.image.upload");
            throw new ImageUploadException(errorMsg);
        }
    }

    /**
     * Write image to byte array.
     * 
     * @param file The multipart file.
     * @return The byte array.
     * @throws IOException If an I/O error occurs.
     */
    private byte[] writeImage(MultipartFile file) throws IOException {

        BufferedImage imageBuffer = ImageIO.read(file.getInputStream());
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        String formatName = Strings.isNullOrEmpty(file.getContentType())
                ? ""
                : file.getContentType().split("/")[1];
        if (formatName.isBlank()) {
            var errorMsg = messageService.getMessage("exception.empty",
                    new Object[] { new DefaultMessageSourceResolvable("label.image.name") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }

        ImageIO.write(imageBuffer, formatName, baos);
        return baos.toByteArray();
    }

    /**
     * Check if file is allowed.
     * 
     * @param file The multipart file.
     */
    protected void isFileAllowed(MultipartFile file) {

        final String fileName = file.getOriginalFilename();

        if (!FileUploadUtil.isAllowedExtension(fileName, FileUploadUtil.IMAGE_PATTERN)) {

            var errorMsg = messageService.getMessage("exception.invalid",
                    new Object[] { new DefaultMessageSourceResolvable("label.image") });
            throw new HttpResponseException(HttpStatus.BAD_REQUEST,
                    AppConstants.INVALID_ARGUMENT,
                    errorMsg);
        }
    }

    /**
     * Upload image asynchronously.
     * 
     * @param file       The multipart file.
     * @param folderName The folder name.
     * @return The image.
     */
    @Async
    protected CompletableFuture<Image> uploadAsync(MultipartFile file, String folderName) {

        return CompletableFuture.completedFuture(upload(file, folderName));
    }

    public List<Image> uploadMultiple(List<MultipartFile> files, String folderName) {

        List<CompletableFuture<Image>> futures = new ArrayList<>();

        for (MultipartFile file : files) {
            CompletableFuture<Image> future = uploadAsync(file, folderName);
            futures.add(future);
        }

        // Wait for all futures to complete and gather the results
        CompletableFuture<Void> allUploads = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));

        return allUploads.thenApply(v -> futures.stream()
                .map(CompletableFuture::join) // Join each future to get the result
                .filter(Objects::nonNull) // Filter out any failed uploads
                .collect(Collectors.toList()))
                .join();
    }

    public boolean deleteImage(Long id) {

        imageRepo.deleteById(id);
        return true;
    }

    public void deleteImages(List<Long> ids) {

        imageRepo.deleteAllByIdInBatch(ids);
    }
}
