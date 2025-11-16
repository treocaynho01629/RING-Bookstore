package com.ring.common;

import com.cloudinary.Transformation;

/**
 * A class containing the transformations for the Cloudinary images.
 */
public class CloudinaryTransformations {

        public static final Transformation<?> SHOP_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(75)
                        .crop("thumb")
                        .chain()
                        .radius("max")
                        .quality("auto")
                        .fetchFormat("auto");

        public static final Transformation<?> PRODUCT_THUMBNAIL_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(90)
                        .quality("auto")
                        .fetchFormat("auto");

        public static final Transformation<?> PRODUCT_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(600)
                        .quality("auto")
                        .fetchFormat("auto");

        public static final Transformation<?> AVATAR_SMALL_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(25)
                        .crop("thumb")
                        .chain()
                        .radius("max")
                        .quality("auto")
                        .fetchFormat("auto");

        public static final Transformation<?> AVATAR_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(55)
                        .crop("thumb")
                        .chain()
                        .radius("max")
                        .quality(50)
                        .fetchFormat("auto");

        public static final Transformation<?> PROFILE_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(320)
                        .chain()
                        .radius("max")
                        .quality("auto")
                        .fetchFormat("auto");

        public static final Transformation<?> ASSETS_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(250)
                        .quality("auto")
                        .fetchFormat("auto");

        public static final Transformation<?> PREVIEW_CATEGORY_TRANSFORMATION = new Transformation<>()
                        .aspectRatio("1.0")
                        .width(70)
                        .quality("auto")
                        .fetchFormat("auto");
}
