package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "file_info")
public class FileInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName; // 파일명
    private String fileUrl; // 저장된 파일 URL
    private String fileType; // 파일 타입 (예: image/png, application/pdf)
    private Long fileSize; // 파일 크기 (byte 단위)

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = true)
    private Post post; // 게시글과 연결 (게시글에 첨부된 경우)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_log_id", nullable = true)
    private ActivityLog activityLog; // 게시글과 연결 (피드드에 첨부된 경우)

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = true)
    private Task task; // 업무와 연결 (업무에 첨부된 경우)

    // 프로젝트와의 관계 추가
    @ManyToOne
    @JoinColumn(name = "project_id", referencedColumnName = "id", nullable = true)
    private Project project;

    public FileInfo(String fileName, String fileUrl, String fileType, Long fileSize) {
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
}
