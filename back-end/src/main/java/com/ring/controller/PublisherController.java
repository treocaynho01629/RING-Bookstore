package com.ring.controller;

import com.ring.dto.request.PublisherRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.model.entity.Publisher;
import com.ring.service.PublisherService;
import com.ring.service.impl.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller named {@link PublisherController} for handling publisher-related operations.
 * Exposes endpoints under "/api/publishers".
 */
@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
public class PublisherController {

    private final PublisherService pubService;
    private final MessageService messageService;
    /**
     * Retrieves all publishers with pagination and sorting.
     *
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param sortBy   sorting field.
     * @param sortDir  sorting direction.
     * @return a {@link ResponseEntity} containing paginated publishers.
     */
    @GetMapping
    public ResponseEntity<PagingResponse<PublisherDTO>> getPublishers(
            @RequestParam(value = "pSize", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @RequestParam(value = "sortBy", defaultValue = "id") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        PagingResponse<PublisherDTO> publishers = pubService.getPublishers(pageNo, pageSize, sortBy, sortDir);
        return new ResponseEntity<>(publishers, HttpStatus.OK);
    }

    /**
     * Retrieves publishers relevant to a specific category.
     *
     * @param pageSize size of each page.
     * @param pageNo   page number.
     * @param cateId   ID of the category.
     * @return a {@link ResponseEntity} containing relevant publishers.
     */
    @GetMapping("/relevant/{id}")
    public ResponseEntity<PagingResponse<PublisherDTO>> getRelevantPublishers(
            @RequestParam(value = "pSize", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "pageNo", defaultValue = "0") Integer pageNo,
            @PathVariable("id") Integer cateId) {

        PagingResponse<PublisherDTO> publishers = pubService.getRelevantPublishers(pageNo, pageSize, cateId);
        return new ResponseEntity<>(publishers, HttpStatus.OK);
    }

    /**
     * Retrieves a publisher by its ID.
     *
     * @param id the publisher ID.
     * @return a {@link ResponseEntity} containing the publisher.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PublisherDTO> getPublisherById(@PathVariable("id") Integer id) {

        PublisherDTO publisher = pubService.getPublisher(id);
        return new ResponseEntity<>(publisher, HttpStatus.OK);
    }

    /**
     * Creates a new publisher.
     *
     * @param request the {@link PublisherRequest} containing publisher data.
     * @return a {@link ResponseEntity} containing the created publisher.
     */
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('create:publisher')")
    public ResponseEntity<Publisher> createPublisher(
            @Valid @RequestPart("request") PublisherRequest request,
            @RequestPart(name = "image", required = false) MultipartFile file) {

        Publisher publisher = pubService.addPublisher(request, file);
        return new ResponseEntity<>(publisher, HttpStatus.CREATED);
    }

    /**
     * Updates a publisher by its ID.
     *
     * @param id   the ID of the publisher to update.
     * @param request the updated publisher data.
     * @param file optional updated image file.
     * @return a {@link ResponseEntity} containing the updated publisher.
     */
    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('update:publisher')")
    public ResponseEntity<Publisher> updatePublisher(
            @PathVariable("id") Integer id,
            @Valid @RequestPart("request") PublisherRequest request,
            @RequestPart(name = "image", required = false) MultipartFile file) {

        Publisher publisher = pubService.updatePublisher(id, request, file);
        return new ResponseEntity<>(publisher, HttpStatus.CREATED);
    }

    /**
     * Deletes a publisher by its ID.
     *
     * @param id the ID of the publisher to delete.
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:publisher')")
    public ResponseEntity<String> deletePublisher(@PathVariable("id") Integer id) {

        pubService.deletePublisher(id);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes multiple publishers by a list of IDs.
     *
     * @param ids list of publisher IDs to delete.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-multiple")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:publisher')")
    public ResponseEntity<String> deletePublishers(@RequestParam("ids") List<Integer> ids) {

        pubService.deletePublishers(ids);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes publishers that are NOT in the given list of IDs.
     *
     * @param ids list of IDs to exclude from deletion.
     * @return a {@link ResponseEntity} containing a success message.
     */
    @DeleteMapping("/delete-inverse")
    @PreAuthorize("hasRole('SELLER') and hasAuthority('delete:book')")
    public ResponseEntity<String> deletePublishersInverse(@RequestParam("ids") List<Integer> ids) {

        pubService.deletePublishersInverse(ids);
        String message = messageService.getMessage("message.delete.succeeded");

        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    /**
     * Deletes all publishers in the system.
     *
     * @return a {@link ResponseEntity} with a success message.
     */
    @DeleteMapping("/delete-all")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('delete:publisher')")
    public ResponseEntity<String> deleteAllPublishers() {
        
        pubService.deleteAllPublishers();
        String message = messageService.getMessage("message.delete.succeeded");
        
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
