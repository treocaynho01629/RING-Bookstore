package com.ring.mapper;

import com.ring.common.AppConstants;
import com.ring.dto.projection.dashboard.IStat;
import com.ring.dto.response.dashboard.ChartDTO;
import com.ring.dto.response.dashboard.StatDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * A mapper for {@link IStat}, {@link ChartDTO}, {@link StatDTO}.
 */
@Service
public class DashboardMapper {

    /**
     * Maps a {@link IStat} to a {@link StatDTO}.
     * 
     * @param projection the projection to map
     * @param id the id of the stat
     * @param label the label of the stat
     * @return the mapped {@link StatDTO}
     */
    public StatDTO statToDTO(IStat projection, String id, String label) {

        Double value = projection.getTotal() != null 
                ? projection.getTotal() 
                : projection.getCurrentMonth();
        BigDecimal diff = BigDecimal.valueOf(projection.getCurrentMonth() == projection.getLastMonth() 
                ? 0
                : projection.getCurrentMonth() / (projection.getLastMonth() == 0 
                    ? 1 
                    : projection.getLastMonth()) - 1);

        return new StatDTO(id, label, value, diff);
    }

    /**
     * Maps a {@link Map<String, Object>} to a {@link ChartDTO}.
     * 
     * @param rawData the raw data to map
     * @return the mapped {@link ChartDTO}
     */
    public ChartDTO dataToChartDTO(Map<String, Object> rawData) {

        String name = rawData.get(AppConstants.NAME).toString();
        Map<String, Long> dataMap = new HashMap<String, Long>();

        // Map back to Long number
        for (Map.Entry<String, Object> e : rawData.entrySet()) {
            
            if (!e.getKey().equals(AppConstants.NAME)) {

                if (dataMap.put(e.getKey(), Double.valueOf(e.getValue().toString()).longValue()) != null) {
                    throw new IllegalStateException(AppConstants.DUPLICATE_KEY);
                }
            }
        }

        return new ChartDTO(name, dataMap);
    }
}
