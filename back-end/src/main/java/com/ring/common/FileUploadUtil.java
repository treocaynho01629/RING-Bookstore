package com.ring.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.ring.model.enums.ImageSize;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class for image uploads and image URL generation.
 */
@RequiredArgsConstructor
@Component
public class FileUploadUtil {

    private final Cloudinary cloudinary;

    public static final String PRODUCT_FOLDER = "/ring/products";
    public static final String SHOP_FOLDER = "/ring/shops";
    public static final String BANNER_FOLDER = "/ring/banners";
    public static final String USER_FOLDER = "/ring/users";
    public static final String ASSET_FOLDER = "/ring/assets";
    public static final String IMAGE_PATTERN = "([^\\s]+(\\.(?i)(jpg|png|gif|bmp))$)";

    /**
     * Checks if the file name has an allowed extension.
     * 
     * @param fileName the file name to check
     * @param pattern the pattern to check against
     * @return {@code true} if the file name has an allowed extension, {@code false} otherwise
     */
    public static boolean isAllowedExtension(final String fileName, final String pattern) {

        final Matcher matcher = Pattern.compile(pattern, Pattern.CASE_INSENSITIVE).matcher(fileName);
        return matcher.matches();
    }

    /**
     * Generates a unique file name for the uploaded file.
     * 
     * @param file the multipart file to generate a unique file name for
     * @return the unique file name
     */
    public static String getFileName(final MultipartFile file) {

        return System.currentTimeMillis()
                + "_"
                + StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
    }

    /**
     * Generates a URL for the uploaded image.
     * 
     * @param publicId the public ID of the image
     * @return the URL of the image
     */
    public Map<String, String> generateUrl(String publicId) {

        // Generate image URL
        Map<String, String> srcSet = new HashMap<>();
        for (ImageSize size : ImageSize.values()) {

            Transformation<?> transformation = new Transformation<>()
                .width(size.getWidth())
                .quality("auto")
                .fetchFormat("auto");

            srcSet.put(size.name(), cloudinary.url()
                    .transformation(transformation)
                    .secure(true)
                    .generate(publicId));
        }

        return srcSet;
    }
}
