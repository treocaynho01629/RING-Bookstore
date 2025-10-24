package com.ring.service;

import com.cloudinary.api.ApiResponse;
import com.ring.dto.response.CloudinaryResponse;

import java.util.List;

/**
 * Service interface for handling Cloudinary image operations.
 */
public interface CloudinaryService {

    /**
     * Replaces an existing image in Cloudinary.
     *
     * @param data     the image data to upload
     * @param publicId the public ID of the image to replace
     * @return the {@link CloudinaryResponse} containing upload details
     */
    CloudinaryResponse replace(byte[] data, String publicId);

    /**
     * Uploads a new image to Cloudinary.
     *
     * @param data       the image data to upload
     * @param name       the name for the uploaded image
     * @param folderName the folder name to store the image in
     * @return the {@link CloudinaryResponse} containing upload details
     */
    CloudinaryResponse upload(byte[] data, String name, String folderName);

    /**
     * Deletes an image from Cloudinary by its public ID.
     *
     * @param publicId the public ID of the image to delete
     */
    void destroy(String publicId);

    /**
     * Deletes multiple images from Cloudinary by their public IDs.
     *
     * @param publicIds the list of public IDs of images to delete
     * @return the {@link ApiResponse} containing deletion details
     */
    ApiResponse destroyMultiple(List<String> publicIds);
}
