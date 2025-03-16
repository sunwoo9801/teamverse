package org.zerock.teamverse.service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.teamverse.entity.ActivityLog;
import org.zerock.teamverse.entity.FileInfo;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.Task;
import org.zerock.teamverse.repository.ActivityLogRepository;
import org.zerock.teamverse.repository.FileInfoRepository;
import org.zerock.teamverse.repository.ProjectRepository;
import org.zerock.teamverse.repository.TaskRepository;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class FileService {
    private final FileInfoRepository fileInfoRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final Path fileStoragePath;

    public FileService(FileInfoRepository fileInfoRepository,
                       ActivityLogRepository activityLogRepository,
                       TaskRepository taskRepository,
                       ProjectRepository projectRepository) {
        this.fileInfoRepository = fileInfoRepository;
        this.activityLogRepository = activityLogRepository;
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.fileStoragePath = Paths.get("storage", "uploads").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStoragePath);
        } catch (IOException e) {
            throw new RuntimeException("🚨 파일 저장 디렉토리를 생성할 수 없습니다.", e);
        }
    }

     // ✅ 파일 업로드 기능
     public String storeFile(MultipartFile file, Long projectId, Long activityLogId, Long taskId) throws Exception {
        if (!Files.exists(fileStoragePath)) {
            Files.createDirectories(fileStoragePath);
        }
    
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path targetLocation = fileStoragePath.resolve(fileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
    
        // ✅ 정적 리소스 URL을 `/storage/uploads/`로 설정
        String fileUrl = "/storage/uploads/" + fileName;
    
        FileInfo fileInfo = new FileInfo(file.getOriginalFilename(), fileUrl, file.getContentType(), file.getSize());
    
        // 프로젝트 ID가 존재하면 저장
        if (projectId != null) {
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("🚨 프로젝트를 찾을 수 없습니다: " + projectId));
            fileInfo.setProject(project);
        }
    
        if (activityLogId != null) {
            ActivityLog activityLog = activityLogRepository.findById(activityLogId)
                    .orElseThrow(() -> new RuntimeException("🚨 ActivityLog not found"));
            fileInfo.setActivityLog(activityLog);
        }
    
        if (taskId != null) {
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("🚨 Task not found"));
            fileInfo.setTask(task);
        }
    
        fileInfoRepository.save(fileInfo);
        return fileUrl; // ✅ 클라이언트에 정적 리소스 URL 반환
    }
    

    
 // ✅ 파일 다운로드 기능 수정
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = fileStoragePath.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("❌ 파일을 찾을 수 없습니다: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("❌ 파일을 찾을 수 없습니다: " + fileName, e);
        }
    }

    // 특정 프로젝트의 파일 목록 조회 기능 
    public List<FileInfo> getFilesByProject(Long projectId) {
        return fileInfoRepository.findByProjectId(projectId);
    }

    // 파일 삭제 기능 (삭제 시 프로젝트와 연관 데이터도 체크)
    public boolean deleteFile(Long fileId) {
        Optional<FileInfo> fileInfoOpt = fileInfoRepository.findById(fileId);

        if (fileInfoOpt.isPresent()) {
            FileInfo fileInfo = fileInfoOpt.get();
            Path filePath = fileStoragePath.resolve(fileInfo.getFileUrl().replace("/uploads/", ""));

            try {
                //  실제 파일 삭제
                Files.deleteIfExists(filePath);
                // DB에서 파일 정보 삭제
                fileInfoRepository.deleteById(fileId);
                return true;
            } catch (Exception e) {
                System.err.println("❌ 파일 삭제 실패: " + e.getMessage());
                return false;
            }
        }
        return false;
    }

    // ZIP 파일 생성 메서드
    public File createZipFile(List<File> files) throws IOException {
        if (files.isEmpty()) {
            throw new IOException("❌ 압축할 파일이 없습니다.");
        }

        File zipFile = new File(fileStoragePath.toFile(), "downloaded_files.zip");

        try (FileOutputStream fos = new FileOutputStream(zipFile);
             ZipOutputStream zos = new ZipOutputStream(fos)) {

            for (File file : files) {
                if (!file.exists()) continue;

                ZipEntry zipEntry = new ZipEntry(file.getName());
                zos.putNextEntry(zipEntry);

                Files.copy(file.toPath(), zos);
                zos.closeEntry();
            }
        }

        return zipFile;
    }

    
}
