package org.zerock.teamverse.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class FileInfoDTO {
    private Long id;
    private String fileName;
    private String filePath;
}
