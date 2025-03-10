package org.zerock.teamverse.controller.GoogleMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/places")
public class PlacesController {

    @Value("${google.maps.api-key}")
    private String googleMapsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // Google Maps API 키 반환하는 엔드포인트 추가
    @GetMapping("/google-maps-key")
    public String getGoogleMapsApiKey() {
        return googleMapsApiKey;
    }

    @GetMapping("/search")
    public Map<String, Object> searchPlaces(@RequestParam String query) {
        String url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
                + "?query=" + query
                + "&key=" + googleMapsApiKey;

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        if (response != null && response.containsKey("results")) {
            List<Map<String, Object>> places = (List<Map<String, Object>>) response.get("results");

            places = places.stream().map(place -> {
                String placeName = (String) place.get("name");
                String formattedAddress = (String) place.get("formatted_address"); // 🔥 주소 추가
                String staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap"
                        + "?center=" + placeName
                        + "&zoom=15"
                        + "&size=600x300"
                        + "&maptype=roadmap"
                        + "&markers=color:red|" + placeName
                        + "&key=" + googleMapsApiKey;

                place.put("mapImageUrl", staticMapUrl);
                place.put("formatted_address", formattedAddress); // 주소 필드 추가
                return place;
            }).collect(Collectors.toList());

            response.put("results", places);
        }

        return response;
    }
}