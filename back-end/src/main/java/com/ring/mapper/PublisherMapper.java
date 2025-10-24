package com.ring.mapper;

import com.cloudinary.Cloudinary;
import com.ring.common.CloudinaryTransformations;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.model.entity.Image;
import com.ring.model.entity.Publisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

/**
 * A mapper for {@link Publisher}, {@link PublisherDTO}.
 */
@RequiredArgsConstructor
@Service
public class PublisherMapper implements Function<Publisher, PublisherDTO> {

    private final Cloudinary cloudinary;

    /**
     * Maps a {@link Publisher} to a {@link PublisherDTO}.
     * 
     * @param publisher the publisher to map
     * @return the mapped {@link PublisherDTO}
     */
    @Override
    public PublisherDTO apply(Publisher publisher) {

        Image image = publisher.getImage();
        String imageUrl = cloudinary.url()
                        .transformation(CloudinaryTransformations.PRODUCT_TRANSFORMATION)
                        .secure(true)
                        .generate(image.getPublicId());

        return new PublisherDTO(publisher.getId(), 
                publisher.getName(),
                imageUrl);
    }
}
