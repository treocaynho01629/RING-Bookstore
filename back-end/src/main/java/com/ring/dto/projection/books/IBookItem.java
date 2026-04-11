package com.ring.dto.projection.books;

import com.ring.model.entity.Book;

/**
 * Represents a book item projection as {@link IBookItem}
 */
public interface IBookItem {

    Long getId();

    Book getBook();

    Short getLength();

    Short getWidth();

    Short getHeight();

    Short getWeight();
}
