package org.zerock.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "task_dependencies")
public class TaskDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne
    @JoinColumn(name = "dependent_task_id", nullable = false)
    private Task dependentTask;
}
