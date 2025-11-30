package com.ring.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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
    public static final int[] PRODUCT_SIZES = { 65, 180, 405 };
    public static final int[] BANNER_SIZES = { 350, 600, 800 };

    /**
     * Checks if the file name has an allowed extension.
     * 
     * @param fileName the file name to check
     * @param pattern  the pattern to check against
     * @return {@code true} if the file name has an allowed extension, {@code false}
     *         otherwise
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
     * Generates a src set for the uploaded image.
     * 
     * @param publicId the public ID of the image
     * @param sizes    the sizes to generate the src set for
     * @return the src set
     */
    public Map<Integer, String> generateSrcSet(String publicId, int[] sizes) {
        return Arrays.stream(sizes)
                .boxed()
                .collect(Collectors.toMap(
                        size -> size,
                        size -> cloudinary.url()
                                .transformation(new Transformation<>()
                                        .width(size)
                                        .quality("auto")
                                        .fetchFormat("auto"))
                                .secure(true)
                                .generate(publicId)));
    }
}
