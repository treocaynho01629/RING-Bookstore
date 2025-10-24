package com.ring.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.ring.dto.response.CloudinaryResponse;
import com.ring.exception.ImageUploadException;
import com.ring.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

/**
 * Service class for managing cloudinary.
 */
@RequiredArgsConstructor
@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;
    private final MessageService messageService;

    // Params
    public static final String PUBLIC_ID = "public_id"; // The image public ID
    public static final String INVALIDATE = "invalidate"; // Should invalidate the image cache or not
    public static final String FOLDER = "folder"; // The folder to store the image in

    public CloudinaryResponse replace(byte[] data, String publicId) {

        try {
            HashMap<Object, Object> options = new HashMap<>();
            options.put(PUBLIC_ID, publicId);
            options.put(INVALIDATE, true);
            cloudinary.uploader().upload(data, options);
            return CloudinaryResponse.builder()
                    .publicId(publicId)
                    .url(cloudinary.url().secure(true).generate(publicId))
                    .build();
        } catch (IOException e) {

            var errorMsg = messageService.getMessage("exception.image.replace");
            throw new ImageUploadException(errorMsg);
        }
    }

    public CloudinaryResponse upload(byte[] data, String name, String folderName) {

        try {

            HashMap<Object, Object> options = new HashMap<>();
            options.put(PUBLIC_ID, name);
            options.put(FOLDER, folderName);
            var uploaded = cloudinary.uploader().upload(data, options);
            String publicId = (String) uploaded.get(PUBLIC_ID);
            return CloudinaryResponse.builder()
                    .publicId(publicId)
                    .url(cloudinary.url().secure(true).generate(publicId))
                    .build();
        } catch (IOException e) {

            var errorMsg = messageService.getMessage("exception.image.upload");
            throw new ImageUploadException(errorMsg);
        }
    }

    public void destroy(String publicId) {

        try {

            HashMap<Object, Object> options = new HashMap<>();
            options.put(INVALIDATE, true);
            cloudinary.uploader().destroy(publicId, options);
        } catch (Exception e) {

            var errorMsg = messageService.getMessage("exception.image.delete");
            throw new ImageUploadException(errorMsg);
        }
    }

    public ApiResponse destroyMultiple(List<String> publicIds) {

        try {

            HashMap<Object, Object> options = new HashMap<>();
            options.put(INVALIDATE, true);
            return cloudinary.api().deleteResources(publicIds, options);
        } catch (Exception e) {

            var errorMsg = messageService.getMessage("exception.image.delete");
            throw new ImageUploadException(errorMsg);
        }
    }
}
