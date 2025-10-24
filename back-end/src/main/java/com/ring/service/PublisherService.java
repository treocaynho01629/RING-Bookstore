package com.ring.service;

import com.ring.dto.request.PublisherRequest;
import com.ring.dto.response.PagingResponse;
import com.ring.dto.response.publishers.PublisherDTO;
import com.ring.model.entity.Publisher;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling publisher-related operations.
 */
public interface PublisherService {

	/**
	 * Retrieves publishers with pagination and sorting options.
	 *
	 * @param pageNo   the page number for pagination
	 * @param pageSize the size of each page
	 * @param sortBy   the field to sort by
	 * @param sortDir  the sorting direction (asc/desc)
	 * @return a paginated list of {@link PublisherDTO} objects
	 */
	PagingResponse<PublisherDTO> getPublishers(Integer pageNo,
			Integer pageSize,
			String sortBy,
			String sortDir);

	/**
	 * Retrieves relevant publishers for a specific category.
	 *
	 * @param pageNo   the page number for pagination
	 * @param pageSize the size of each page
	 * @param cateId   the category ID to get relevant publishers for
	 * @return a paginated list of {@link PublisherDTO} objects
	 */
	PagingResponse<PublisherDTO> getRelevantPublishers(Integer pageNo,
			Integer pageSize,
			Integer cateId);

	/**
	 * Retrieves a publisher by its ID.
	 *
	 * @param id the ID of the publisher
	 * @return the {@link PublisherDTO} object
	 */
	PublisherDTO getPublisher(Integer id);

	/**
	 * Creates a new publisher.
	 *
	 * @param request the publisher creation details
	 * @param file    the publisher logo image file
	 * @return the created {@link Publisher} entity
	 */
	Publisher addPublisher(PublisherRequest request,
			MultipartFile file);

	/**
	 * Updates an existing publisher by its ID.
	 *
	 * @param id      the ID of the publisher to update
	 * @param request the publisher update details
	 * @param file    the new publisher logo image file (optional)
	 * @return the updated {@link Publisher} entity
	 */
	Publisher updatePublisher(Integer id,
			PublisherRequest request,
			MultipartFile file);

	/**
	 * Deletes a publisher by its ID.
	 *
	 * @param id the ID of the publisher to delete
	 */
	void deletePublisher(Integer id);

	/**
	 * Deletes multiple publishers by their IDs.
	 *
	 * @param ids the list of publisher IDs to delete
	 */
	void deletePublishers(List<Integer> ids);

	/**
	 * Deletes publishers that are not in the provided list of IDs.
	 *
	 * @param ids the list of publisher IDs to exclude from deletion
	 */
	void deletePublishersInverse(List<Integer> ids);

	/**
	 * Deletes all publishers.
	 */
	void deleteAllPublishers();
}
