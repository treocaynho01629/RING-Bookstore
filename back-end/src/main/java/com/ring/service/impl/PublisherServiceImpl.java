package com.ring.service.impl;

import com.ring.common.AppConstants;
import com.ring.dto.request.PublisherRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.exception.ResourceNotFoundException;
import com.ring.mapper.PublisherMapper;
import com.ring.model.entity.Image;
import com.ring.model.entity.Publisher;
import com.ring.repository.PublisherRepository;
import com.ring.service.ImageService;
import com.ring.service.PublisherService;
import com.ring.common.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@Service
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository pubRepo;
    private final PublisherMapper pubMapper;

    private final ImageService imageService;
    private final MessageService messageService;

    @Cacheable(cacheNames = AppConstants.PUBLISHERS)
    public PagingResponse<PublisherDTO> getPublishers(Integer pageNo,
            Integer pageSize,
            String sortBy,
            String sortDir) {
        Pageable pageable = PageRequest.of(pageNo, pageSize,
                sortDir.equals(AppConstants.ASCENDING) 
                    ? Sort.by(sortBy).ascending() 
                    : Sort.by(sortBy).descending());

        // Fetch from database
        Page<Publisher> pubsList = pubRepo.findPublishers(pageable);
        List<PublisherDTO> pubDTOS = pubsList.map(pubMapper::apply).toList();
        return new PagingResponse<>(
                pubDTOS,
                pubsList.getTotalPages(),
                pubsList.getTotalElements(),
                pubsList.getSize(),
                pubsList.getNumber(),
                pubsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.PUBLISHERS)
    public PagingResponse<PublisherDTO> getRelevantPublishers(Integer pageNo,
            Integer pageSize,
            Integer cateId) {

        Pageable pageable = PageRequest.of(pageNo, 
                pageSize, 
                Sort.by(AppConstants.ID)
                .descending());

        // Fetch from database
        Page<Publisher> pubsList = pubRepo.findRelevantPublishers(cateId, pageable);
        List<PublisherDTO> pubDTOS = pubsList.map(pubMapper::apply).toList();
        return new PagingResponse<>(
                pubDTOS,
                pubsList.getTotalPages(),
                pubsList.getTotalElements(),
                pubsList.getSize(),
                pubsList.getNumber(),
                pubsList.isEmpty());
    }

    @Cacheable(cacheNames = AppConstants.PUBLISHER, key = "#id")
    public PublisherDTO getPublisher(Integer id) {

        Publisher publisher = pubRepo.findWithImageById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.pub") });
                    return new ResourceNotFoundException(errorMsg);
                });

        PublisherDTO publisherDTO = pubMapper.apply(publisher); // Map to DTO
        return publisherDTO;
    }

    @CacheEvict(cacheNames = AppConstants.PUBLISHERS)
    @Transactional
    public Publisher addPublisher(PublisherRequest request, MultipartFile file) {

        Image image = null;

        // Image upload
        if (file != null) image = imageService.upload(file, FileUploadUtil.ASSET_FOLDER);

        // Create new publisher
        var publisher = Publisher.builder()
                .name(request.getName())
                .image(image)
                .build();
        Publisher addedPub = pubRepo.save(publisher); // Save to database
        return addedPub;
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.PUBLISHERS),
            @CacheEvict(cacheNames = AppConstants.PUBLISHER, key = "#id") })
    @Transactional
    public Publisher updatePublisher(Integer id,
            PublisherRequest request,
            MultipartFile file) {

        // Get original publisher
        Publisher publisher = pubRepo.findById(id)
                .orElseThrow(() -> {
                    var errorMsg = messageService.getMessage("exception.not.found",
                            new Object[]{ new DefaultMessageSourceResolvable("label.pub") });
                    return new ResourceNotFoundException(errorMsg);
                });

        // Image upload/replace
        if (file != null) { // Contain new image >> upload/replace

            Long imageId = publisher.getImage() != null ? publisher.getImage().getId() : null;

            if (imageId != null) imageService.deleteImage(imageId); // Delete old image

            Image savedImage = imageService.upload(file, FileUploadUtil.ASSET_FOLDER); // Upload new image
            publisher.setImage(savedImage); // Set new image
        }

        publisher.setName(request.getName());

        // Update
        Publisher updatedPub = pubRepo.save(publisher);
        return updatedPub;
    }

    @Caching(evict = { @CacheEvict(cacheNames = AppConstants.PUBLISHERS),
            @CacheEvict(cacheNames = AppConstants.PUBLISHER, key = "#id") })
    @Transactional
    public void deletePublisher(Integer id) {
        
        pubRepo.deleteById(id);
    }

    @CacheEvict(cacheNames = AppConstants.PUBLISHERS)
    @Transactional
    public void deletePublishers(List<Integer> ids) {

        pubRepo.deleteAllByIdInBatch(ids);
    }

    @CacheEvict(cacheNames = AppConstants.PUBLISHERS)
    @Transactional
    public void deletePublishersInverse(List<Integer> ids) {

        List<Integer> listDelete = pubRepo.findInverseIds(ids);
        pubRepo.deleteAllByIdInBatch(listDelete);
    }

    @CacheEvict(cacheNames = AppConstants.PUBLISHERS)
    @Transactional
    public void deleteAllPublishers() {

        pubRepo.deleteAll();
    }
}
