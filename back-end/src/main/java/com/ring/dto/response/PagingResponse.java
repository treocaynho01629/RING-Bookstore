package com.ring.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Collection;

/**
 * Represents a paging response as {@link PagingResponse}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagingResponse<T> {

    private Collection<T> content;
    private Integer totalPages;
    private long totalElements;
    private Integer size;
    private Integer page;
    private boolean empty;
}
