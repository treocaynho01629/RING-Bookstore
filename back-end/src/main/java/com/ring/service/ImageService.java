package com.ring.service;

import com.ring.model.entity.Image;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling image operations.
 */
public interface ImageService {

    /**
     * Retrieves all images.
     *
     * @return a list of all {@link Image} entities
     */
    List<Image> getAllImages();

    /**
     * Replaces an existing image with a new one.
     *
     * @param file the new image file
     * @param id   the ID of the image to replace
     * @return the updated {@link Image} entity
     */
    Image replace(MultipartFile file, Long id);

    /**
     * Uploads a new image to the specified folder.
     *
     * @param file       the image file to upload
     * @param folderName the folder name to store the image in
     * @return the uploaded {@link Image} entity
     */
    Image upload(MultipartFile file, String folderName);

    /**
     * Uploads multiple images to the specified folder.
     *
     * @param files      the list of image files to upload
     * @param folderName the folder name to store the images in
     * @return a list of uploaded {@link Image} entities
     */
    List<Image> uploadMultiple(List<MultipartFile> files, String folderName);

    /**
     * Deletes an image by its ID.
     *
     * @param id the ID of the image to delete
     * @return true if the image was successfully deleted, false otherwise
     */
    boolean deleteImage(Long id);

    /**
     * Deletes multiple images by their IDs.
     *
     * @param ids the list of IDs of images to delete
     */
    void deleteImages(List<Long> ids);
}
