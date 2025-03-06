package org.zerock.teamverse.dto;

import org.zerock.teamverse.entity.LikeType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LikeRequest {
    private Long userId;
    private LikeType type;
}

