package com.ring.model.enums;

import lombok.Getter;

/**
 * Enum representing the privilege type as {@link PrivilegeType}.
 */
@Getter
public enum PrivilegeType {

    READ_BOOK("read:book", "read.product"),
    CREATE_BOOK("create:book", "create.product"),
    UPDATE_BOOK("update:book", "update.product"),
    DELETE_BOOK("delete:book", "delete.product"),

    READ_USER("read:user", "read.user"),
    CREATE_USER("create:user", "create.user"),
    UPDATE_USER("update:user", "update.user"),
    DELETE_USER("delete:user", "delete.user"),

    READ_PROFILE("read:profile", "read.profile"),
    UPDATE_PROFILE("update:profile", "update.profile"),

    READ_ADDRESS("read:address", "read.address"),
    CREATE_ADDRESS("create:address", "create.address"),
    UPDATE_ADDRESS("update:address", "update.address"),
    DELETE_ADDRESS("delete:address", "delete.address"),

    READ_CART("read:cart", "read.cart"),
    CREATE_CART("create:cart", "create.cart"),
    UPDATE_CART("update:cart", "update.cart"),
    DELETE_CART("delete:cart", "delete.cart"),

    READ_BANNER("read:banner", "read.banner"),
    CREATE_BANNER("create:banner", "create.banner"),
    UPDATE_BANNER("update:banner", "update.banner"),
    DELETE_BANNER("delete:banner", "delete.banner"),

    READ_CATEGORY("read:category", "read.category"),
    CREATE_CATEGORY("create:category", "create.category"),
    UPDATE_CATEGORY("update:category", "update.category"),
    DELETE_CATEGORY("delete:category", "delete.category"),

    READ_PUBLISHER("read:publisher", "read.publisher"),
    CREATE_PUBLISHER("create:publisher", "create.publisher"),
    UPDATE_PUBLISHER("update:publisher", "update.publisher"),
    DELETE_PUBLISHER("delete:publisher", "delete.publisher"),

    READ_COUPON("read:coupon", "read.coupon"),
    CREATE_COUPON("create:coupon", "create.coupon"),
    UPDATE_COUPON("update:coupon", "update.coupon"),
    DELETE_COUPON("delete:coupon", "delete.coupon"),

    READ_IMAGE("read:image", "read.image"),
    CREATE_IMAGE("create:image", "create.image"),
    UPDATE_IMAGE("update:image", "update.image"),
    DELETE_IMAGE("delete:image", "delete.image"),

    READ_ORDER("read:order", "read.order"),
    WRITE_ORDER("create:order", "create.order"),
    UPDATE_ORDER("update:order", "update.order"),

    READ_ROLE("read:role", "read.role"),
    UPDATE_ROLE("update:role", "update.role"),

    READ_SHOP("read:shop", "read.shop"),
    CREATE_SHOP("create:shop", "create.shop"),
    UPDATE_SHOP("update:shop", "update.shop"),
    DELETE_SHOP("delete:shop", "delete.shop"),

    READ_REVIEW("read:review", "read.review"),
    CREATE_REVIEW("create:review", "create.review"),
    UPDATE_REVIEW("update:review", "update.review"),
    DELETE_REVIEW("delete:review", "delete.review");

    private final String privilege;
    private final String label;

    private PrivilegeType(String privilege, String label) {
        this.privilege = privilege;
        this.label = label;
    }

}
