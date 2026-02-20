package com.ring.common;

import java.time.LocalDate;

public class AppConstants {

    // Common
    public static final String REFRESH_TOKEN_LABEL = "refresh token";
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_RESPONSE = "response";
    public static final String HEADER_CAPTCHA_SOURCE = "source";
    public static final String HEADER_X_REFRESH_TOKEN = "X-Refresh-Token";
    public static final String DELIMITER = ",";

    // Static resources
    public static final String LOGO_PATH = "static/logo.png";

    // Keywords
    public static final String NAME = "name";
    public static final String ENUMS = "enums";
    public static final String ID = "id";
    public static final String IDS = "ids";
    public static final String REFRESH_TOKEN = "refreshToken";
    public static final String LOGO = "logo";
    public static final String CLIENT_PATH = "clientUrl";
    public static final String ACCOUNTS = "accounts";
    public static final String ACCOUNT_DETAIL = "accountDetail";
    public static final String ACCOUNT_ANALYTICS = "accountAnalytics";
    public static final String PROFILE = "profile";
    public static final String USERS = "users";
    public static final String ADDRESS = "address";
    public static final String ADDRESSES = "addresses";
    public static final String USER_ADDRESS = "userAddress";
    public static final String BANNERS = "banners";
    public static final String BANNER_DETAIL = "bannerDetail";
    public static final String BOOK = "book";
    public static final String BOOKS = "books";
    public static final String BOOK_DETAIL = "bookDetail";
    public static final String BOOK_SUGGESTIONS = "bookSuggestions";
    public static final String BOOK_ANALYTICS = "bookAnalytics";
    public static final String CATEGORIES = "categories";
    public static final String CATEGORY_DETAIL = "categoryDetail";
    public static final String CATEGORY_PREVIEWS = "categoryPreviews";
    public static final String CHILDREN = "children";
    public static final String PARENT = "parent";
    public static final String COUPON = "coupon";
    public static final String COUPONS = "coupons";
    public static final String COUPON_DETAIL = "couponDetail";
    public static final String COUPON_ANALYTICS = "couponAnalytics";
    public static final String ORDERS = "orders";
    public static final String ORDER_DETAIL = "orderDetail";
    public static final String ORDER_ANALYTICS = "orderAnalytics";
    public static final String ROLE = "role";
    public static final String ROLES = "roles";
    public static final String PRIVILEGES = "privileges";
    public static final String SHOP = "shop";
    public static final String SHOPS = "shops";
    public static final String SHOP_DETAIL = "shopDetail";
    public static final String SHOP_INFO = "shopInfo";
    public static final String SHOP_ANALYTICS = "shopAnalytics";
    public static final String REVIEWS = "reviews";
    public static final String REVIEW_DETAIL = "reviewDetail";
    public static final String REVIEW_ANALYTICS = "reviewAnalytics";
    public static final String PUBLISHERS = "publishers";
    public static final String PUBLISHER = "publisher";
    public static final String PUBLISHER_DETAIL = "publisherDetail";
    public static final String PUBLISHER_ANALYTICS = "publisherAnalytics";
    public static final String CALCULATE = "calculate";
    public static final String RECEIPTS = "receipts";
    public static final String SALES = "sales";
    public static final String PAYMENT_LINK = "paymentLink";
    public static final String PAYMENT = "payment";
    public static final String WEBHOOK = "webhook";
    public static final String IMAGE = "image";
    public static final String TOKEN = "token";

    // Params
    public static final String PAGE = "pageNo";
    public static final String PAGE_SIZE = "pSize";
    public static final String SORT = "sortBy";
    public static final String SORT_DIRECTION = "sortDir";
    public static final String KEYWORD = "keyword";
    public static final String ASCENDING = "asc";
    public static final String DESCENDING = "desc";
    public static final String SHOP_ID = "shopId";
    public static final String BY_SHOP = "byShop";
    public static final String REQUEST = "request";
    public static final String DEFAULT_SMALL_PAGE_SIZE = "5";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_PAGE = "0";

    // Validation
    public static final int MAX_ADDRESSES_SIZE = 5;
    public static final LocalDate DEFAULT_DATE = LocalDate.of(1970, 1, 1);
    public static final long MAX_FILE_SIZE = 1048576; // 1 MB

    // Exceptions
    public static final String NOT_FOUND = "Resource not found";
    public static final String INVALID_OWNERSHIP = "Invalid ownership";
    public static final String INVALID_CAPTCHA = "Turnstile verification failed";
    public static final String INVALID_DATE = "Invalid date";
    public static final String INVALID_COUPON = "Invalid coupon";
    public static final String INVALID_ARGUMENT = "Invalid argument";
    public static final String MISSING_COOKIE = "Missing cookie request";
    public static final String UPLOAD_IMAGE_FAILED = "Upload image failed";
    public static final String TOO_MANY_LOGIN_ATTEMPTS = "Too many failed login attempts";
    public static final String USER_EXISTED = "User already existed";
    public static final String ROLE_REMOVE_ERROR = "Role cannot be removed";
    public static final String PASSWORD_INCORRECT = "Password incorrect";
    public static final String PASSWORD_NOT_MATCH = "Password not match";
    public static final String ADDRESS_SIZE_LIMIT = "Address size limit reached";
    public static final String COUPON_EXPIRED = "Coupon expired";
    public static final String OUT_OF_STOCK = "Product out of stock";
    public static final String PAYMENT_FAILED = "Payment failed";
    public static final String PAYMENT_CANCEL_FAILED = "Payment cancel failed";
    public static final String REFRESH_TOKEN_FAILED = "Refresh token failed";
    public static final String RESET_PASSWORD_FAILED = "Reset password failed";
    public static final String REVIEW_INVALID = "Review invalid";
    public static final String REVIEW_EXISTED = "Review existed";
    public static final String INTERNAL_SERVER_ERROR = "An internal server error occurred";
    public static final String FILE_SIZE_EXCEED_MAXIMUM_LIMIT = "File size exceed maximum limit";
    public static final String AUTHORIZATION_FAILED = "Authorization failed";
    public static final String DUPLICATE_KEY = "Duplicate key";

}
