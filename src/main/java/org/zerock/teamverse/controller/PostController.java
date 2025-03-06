package org.zerock.teamverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.zerock.teamverse.dto.PostDTO;
import org.zerock.teamverse.entity.FileInfo;
import org.zerock.teamverse.entity.Post;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.FileInfoRepository;
import org.zerock.teamverse.service.PostService;
import org.zerock.teamverse.service.ProjectService;
import org.zerock.teamverse.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final ProjectService projectService;
    private final UserService userService;
    private final FileInfoRepository fileInfoRepository;

    public PostController(PostService postService, ProjectService projectService, UserService userService,
            FileInfoRepository fileInfoRepository) {
        this.postService = postService;
        this.projectService = projectService;
        this.userService = userService;
        this.fileInfoRepository = fileInfoRepository;
    }

    // ✅ 새로운 게시글 추가
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestParam String title, @RequestParam String content,
            @RequestParam Long projectId, @RequestParam Long userId,
            @RequestParam(required = false) List<Long> fileIds) {

        Project project = projectService.getProjectById(projectId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없습니다."));

        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Post post = postService.createPost(user, project, title, content);

        // 파일 연결
        if (fileIds != null && !fileIds.isEmpty()) {
            List<FileInfo> files = fileInfoRepository.findAllById(fileIds);
            post.setFiles(files);
            files.forEach(file -> file.setPost(post));
        }

        // ✅ post 저장 (오류 해결!)
        Post savedPost = postService.save(post);
        return ResponseEntity.ok(savedPost);
    }

    // ✅ 프로젝트별 게시글 목록 조회
    @GetMapping("/{projectId}")
    public ResponseEntity<List<PostDTO>> getPostsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(postService.getPostsByProject(projectId));
    }
}
