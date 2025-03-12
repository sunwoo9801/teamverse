package org.zerock.teamverse.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
public class EmojiFileController {

    private final String uploadDir = "storage/uploads";

    @GetMapping("/{fileName:.+}")
    public Resource getFile(@PathVariable String fileName) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        return new UrlResource(filePath.toUri());
    }
}
