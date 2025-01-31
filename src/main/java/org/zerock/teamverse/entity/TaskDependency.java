package org.zerock.teamverse.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "task_dependencies")
public class TaskDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "dependent_task_id", nullable = false)
    private Task dependentTask;
}
