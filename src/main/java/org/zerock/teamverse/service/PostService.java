package org.zerock.teamverse.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.teamverse.dto.PostDTO;
import org.zerock.teamverse.entity.Post;
import org.zerock.teamverse.entity.Project;
import org.zerock.teamverse.entity.User;
import org.zerock.teamverse.repository.PostRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // ✅ 게시글 저장
    @Transactional
    public Post createPost(User user, Project project, String title, String content) {
        Post post = new Post();
        post.setUser(user);
        post.setProject(project);
        post.setTitle(title); // ✅ 제목 저장
        post.setContent(content);
        return postRepository.save(post);
    }

 // ✅ 특정 프로젝트의 게시글 가져오기 (DTO 변환 추가)
    public List<PostDTO> getPostsByProject(Long projectId) {
        return postRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream().map(PostDTO::new).collect(Collectors.toList());
    }

      //  Post 저장 메서드
      public Post save(Post post) {
        return postRepository.save(post);
    }

}
