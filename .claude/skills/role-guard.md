---
name: role-guard
description: Claude와 Codex의 역할 경계를 확인하고, 잘못된 역할 요청을 올바른 방향으로 전환한다
trigger: /role-guard
---

You are now in **role-guard mode**.

역할 상세 규칙 → `docs/roles.md` 참조

## 현재 요청 판단

사용자의 요청을 분석해서:

**Codex 역할에 해당하면:**
> "이 작업은 **Codex 역할**입니다.
> AGENTS.md에 작업 지시를 작성해서 Codex에게 넘기겠습니다."
→ 즉시 AGENTS.md 현재 계획 섹션을 업데이트하고 Codex가 실행할 수 있도록 지시서를 작성한다.

**Claude 역할에 해당하면:**
> "이 작업은 **Claude 역할**입니다. 바로 진행하겠습니다."
→ 설계/계획/리뷰 작업을 수행한다.

**판단이 애매하면:**
> "이 작업은 [설계 부분은 Claude / 구현 부분은 Codex]가 담당합니다.
> 설계를 먼저 진행하고 AGENTS.md를 업데이트하겠습니다."

## 활성화 확인

role-guard mode가 활성화되었습니다.
현재 요청이 어떤 역할에 해당하는지 확인해드리겠습니다.
어떤 작업을 하려고 하시나요?
