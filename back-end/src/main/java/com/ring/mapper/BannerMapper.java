package com.ring.mapper;

import java.util.Map;
import java.util.function.Function;

import com.ring.dto.projection.banners.IBanner;
import com.ring.dto.projection.images.IImage;
import com.ring.dto.response.banners.BannerDTO;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * A mapper for {@link IBanner} to {@link BannerDTO}.
 */
@RequiredArgsConstructor
@Service
public class BannerMapper implements Function<IBanner, BannerDTO> {

    private final FileUploadUtil fileUploadUtil;

    /**
     * Maps a {@link IBanner} to a {@link BannerDTO}.
     * 
     * @param banner the banner to map
     * @return the mapped {@link BannerDTO}
     */
    @Override
    public BannerDTO apply(IBanner banner) {

        IImage image = banner.getImage();

        // Generate image URL
        Map<Integer, String> srcSet = fileUploadUtil.generateSrcSet(image.getPublicId(),
                FileUploadUtil.BANNER_SIZES);
        srcSet.put(1200, image.getUrl());

        return new BannerDTO(banner.getId(),
                banner.getShopId(),
                banner.getName(),
                banner.getDescription(),
                srcSet,
                banner.getUrl());
    }
}
