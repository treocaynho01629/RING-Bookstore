package com.ring.dto.projection.reviews;

/**
 * Projection for review analytics.
 */
public interface IReviewAnalytics {

    Double getRating();

    Long getTotalRates();

    Long getRate5();

    Long getRate4();

    Long getRate3();

    Long getRate2();

    Long getRate1();
}
