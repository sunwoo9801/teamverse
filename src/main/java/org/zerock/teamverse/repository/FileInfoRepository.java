package org.zerock.teamverse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.zerock.teamverse.entity.FileInfo;
import org.zerock.teamverse.entity.Project;

@Repository
public interface FileInfoRepository extends JpaRepository<FileInfo, Long> {

   // 프로젝트 ID로 파일 조회하는 메서드 
   List<FileInfo> findByProjectId(Long projectId);

   //  파일 URL을 기준으로 파일 조회 (파일이 하나만 존재한다고 가정)
   Optional<FileInfo> findByFileUrl(String fileUrl);

       void deleteByProject(Project project);

}
