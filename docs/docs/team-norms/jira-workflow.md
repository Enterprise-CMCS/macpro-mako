---
layout: default
title: JIRA Workflow
parent: Team Norms
nav_order: 2
---

# JIRA Workflow

## Introduction

This document outlines our team's process for managing tasks using the JIRA Kanban board. It's designed to provide clarity and consistency on how we track and progress through work items.

## Workflow Stages

### Backlog

- **Population**: The backlog is populated with new tasks during the planning phase.
- **Prioritization**: Tasks are prioritized based on urgency and importance.

### Ready

- **Preparation**: Tasks are moved to "Ready" once they are clearly defined and ready for development.
- **Final Checks**: Ensure that all necessary information and acceptance criteria are present.  Story points should be added prior to moving to Ready.

### In Progress

- **Active Development**: When a task is actively being worked on, it is moved to "In Progress".
- **Daily Updates**: Developers should provide daily updates or comments on the task to indicate progress.

### In Review

- **Code Review**: Tasks are moved here when the development is complete and they are awaiting code review.
- **Peer Feedback**: Team members provide feedback and approval. If feedback requires a significant modification or rewrite to the code, the ticket should be moved back to In Progress.

### In Testing

- **Quality Assurance**: Tasks in this column are undergoing thorough testing by the QA team.
- **Hands Off**: Developers should not push code that updates environments for work that is In Testing, without coordinating with the QA team.  This is to prevent deployments interfering with the QA process.
- **Bug Reporting**: Any issues discovered during testing are reported and linked to the task.
- **Failures**: If a ticket fails QA for reasons that should not be addressed separately (like a bug), the QA team will move the ticket back to In Review.

### Ready for Merge

- **Final Approval**: Once testing is complete and the task has passed all checks, it moves to "Ready for Merge".
- **Merge Preparation**: The task is prepared for merging into the main codebase.

### In Pipeline

- **Deployment**: Tasks here have been merged to master, and are in the process of being verified on master by the QA team.
- **Monitoring**: Close monitoring of the feature in the live environment for any immediate issues.

### Done

- **Completion**: Tasks are moved to "Done" when they are merged to master and verified on master, if applicable.
- **Review**: The team may review completed tasks to ensure all objectives were met.
- **Demo Coordination**: If the completed work is going to be demoed, coordinate a time with Product to relay the context of the feature and how to demonstrate it.

## Sprint Tracking

### Current and Upcoming Sprints

- **Active Sprint**: Tasks currently being worked on are tracked under the active sprint, e.g., "Sprint 2.4".
- **Future Sprints**: Upcoming work items are assigned to future sprints, and periodically rescheduled during refinement as events unfold.

### Sprint Review

- **Regular Reviews**: At the end of each sprint, the team reviews progress and adjusts future plans accordingly.
- **Continuous Improvement**: Lessons learned are discussed and processes are adjusted to improve future sprints.

## Responsibility and Accountability

- **Ownership**: Team members take ownership of tasks they are working on and update their status accordingly.
- **Collaboration**: The entire team collaborates to ensure tasks move smoothly through the workflow.

By adhering to this JIRA workflow, we aim to maintain a high level of organization and efficiency within our development process.