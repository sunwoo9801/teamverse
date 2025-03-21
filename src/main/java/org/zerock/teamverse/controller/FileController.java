package org.zerock.teamverse.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.teamverse.entity.FileInfo;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.repository.FileInfoRepository;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.service.FileService;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final FileInfoRepository fileInfoRepository;
    private final ProjectRepository projectRepository;

    public FileController(FileService fileService, FileInfoRepository fileInfoRepository,
            ProjectRepository projectRepository) {
        this.fileService = fileService;
        this.fileInfoRepository = fileInfoRepository;
        this.projectRepository = projectRepository;
    }


// ✅ 파일 업로드 API
@PostMapping("/upload")
public ResponseEntity<Map<String, String>> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "projectId", required = false) Long projectId,
        @RequestParam(value = "activityLogId", required = false) Long activityLogId,
        @RequestParam(value = "taskId", required = false) Long taskId) {
    try {
        String fileUrl = fileService.storeFile(file, projectId, activityLogId, taskId);
        
        // ✅ 파일명과 타입도 포함하여 반환
        Map<String, String> response = new HashMap<>();
        response.put("fileUrl", "https://teamverse.onrender.com" + fileUrl);
        response.put("fileName", file.getOriginalFilename());
        response.put("fileType", file.getContentType());

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.internalServerError().body(null);
    }
}


    @GetMapping
    public ResponseEntity<List<String>> getAllFiles(@RequestParam("projectId") Long projectId) {
        List<String> fileUrls = fileService.getFilesByProject(projectId).stream()
                .map(FileInfo::getFileUrl)
                .collect(Collectors.toList());
        return ResponseEntity.ok(fileUrls);
    }


    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Map<String, String>>> getFilesByProject(@PathVariable Long projectId) {
        System.out.println("프로젝트 파일 조회 요청: projectId = " + projectId); // 디버깅 로그

        // 프로젝트 존재 여부 확인
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("❌ 프로젝트를 찾을 수 없습니다. ID: " + projectId));

        // 파일 조회 (fileInfoRepository에서 직접 projectId로 검색)
        List<FileInfo> files = fileInfoRepository.findByProjectId(projectId);
        System.out.println("조회된 파일 개수: " + files.size()); // 디버깅 로그

        if (files.isEmpty()) {
            System.out.println("⚠️ 해당 프로젝트에 파일이 없습니다.");
        }

        for (FileInfo file : files) {
            System.out.println("파일 정보: " + file.getFileName() + " - " + file.getFileUrl()); // 디버깅 로그
        }

        // 조회된 파일 정보 리스트 반환 (fileName)
        List<Map<String, String>> fileDataList = files.stream()
                .map(file -> Map.of(
                        "fileId", String.valueOf(file.getId()), // fileId 포함
                        "fileName", file.getFileName(), // fileName 포함
                        "fileUrl", "https://teamverse.onrender.com" + file.getFileUrl(), // 절대 경로 반환
                        "fileType", file.getFileType()  // ✅ MIME 타입 추가

                        ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(fileDataList);
    }

    @DeleteMapping("/delete/{fileId}")
    public ResponseEntity<String> deleteFile(@PathVariable Long fileId) {
        boolean isDeleted = fileService.deleteFile(fileId);

        if (isDeleted) {
            return ResponseEntity.ok("파일이 삭제되었습니다.");
        } else {
            return ResponseEntity.status(500).body("❌ 파일 삭제 실패");
        }
    }
    // ✅ 파일 다운로드 API
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        Resource resource = fileService.loadFileAsResource(fileName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
    
     @GetMapping("/download")
    public ResponseEntity<byte[]> downloadSelectedFiles(@RequestParam List<Long> fileIds) {
        try {
            List<File> files = fileInfoRepository.findAllById(fileIds).stream()
                    .map(fileInfo -> new File("uploads/" + fileInfo.getFileUrl().replace("/uploads/", "")))
                    .toList();

            if (files.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }


        if (files.size() == 1) {
            // 한 개 파일만 다운로드 요청한 경우, 바로 해당 파일 반환
            File singleFile = files.get(0);
            byte[] fileContent = Files.readAllBytes(singleFile.toPath());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + singleFile.getName() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileContent);
        }

                // 여러 개 선택했을 경우 ZIP 파일 생성 후 반환
            File zipFile = fileService.createZipFile(files);

            byte[] zipContent = Files.readAllBytes(zipFile.toPath());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"files.zip\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(zipContent);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
