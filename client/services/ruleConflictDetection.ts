import { OverrideRule, TriggerCondition, TriggerConditions } from '../shared/aiMarketingScenarioData';

export interface RuleConflict {
  type: 'overlap' | 'contradiction' | 'redundancy' | 'priority' | 'performance';
  severity: 'warning' | 'error' | 'info';
  description: string;
  conflictingRules: string[]; // rule IDs
  suggestion?: string;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: RuleConflict[];
  riskScore: number; // 0-100, higher = more risky
}

export class RuleConflictDetector {
  /**
   * 检测新规则与现有规则的冲突
   */
  detectConflicts(newRule: OverrideRule, existingRules: OverrideRule[]): ConflictDetectionResult {
    const conflicts: RuleConflict[] = [];
    
    // 1. 检测条件重叠
    conflicts.push(...this.detectConditionOverlap(newRule, existingRules));
    
    // 2. 检测响应动作冲突
    conflicts.push(...this.detectActionConflicts(newRule, existingRules));
    
    // 3. 检测优先级问题
    conflicts.push(...this.detectPriorityIssues(newRule, existingRules));
    
    // 4. 检测冗余规则
    conflicts.push(...this.detectRedundancy(newRule, existingRules));
    
    // 5. 检测性能影响
    conflicts.push(...this.detectPerformanceIssues(newRule, existingRules));
    
    const riskScore = this.calculateRiskScore(conflicts);
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      riskScore
    };
  }

  /**
   * 检测触发条件重叠
   */
  private detectConditionOverlap(newRule: OverrideRule, existingRules: OverrideRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    for (const existingRule of existingRules) {
      if (!existingRule.isEnabled) continue;
      
      const overlapScore = this.calculateConditionOverlap(
        newRule.triggerConditions,
        existingRule.triggerConditions
      );
      
      if (overlapScore > 0.8) {
        conflicts.push({
          type: 'overlap',
          severity: 'warning',
          description: `规则 "${newRule.ruleName}" 与规则 "${existingRule.ruleName}" 的触发条件高度重叠（${Math.round(overlapScore * 100)}%）`,
          conflictingRules: [newRule.ruleId, existingRule.ruleId],
          suggestion: '考虑合并这两个规则或调整触发条件以避免重复执行'
        });
      } else if (overlapScore > 0.5) {
        conflicts.push({
          type: 'overlap',
          severity: 'info',
          description: `规则 "${newRule.ruleName}" 与规则 "${existingRule.ruleName}" 的触发条件部分重叠（${Math.round(overlapScore * 100)}%）`,
          conflictingRules: [newRule.ruleId, existingRule.ruleId],
          suggestion: '建议检查是否需要调整优先级或条件逻辑'
        });
      }
    }
    
    return conflicts;
  }

  /**
   * 检测响应动作冲突
   */
  private detectActionConflicts(newRule: OverrideRule, existingRules: OverrideRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    for (const existingRule of existingRules) {
      if (!existingRule.isEnabled) continue;
      
      // 检查是否存在条件重叠且动作相互冲突的情况
      const overlapScore = this.calculateConditionOverlap(
        newRule.triggerConditions,
        existingRule.triggerConditions
      );
      
      if (overlapScore > 0.3) {
        const actionConflict = this.checkActionContradiction(
          newRule.responseAction,
          existingRule.responseAction
        );
        
        if (actionConflict) {
          conflicts.push({
            type: 'contradiction',
            severity: 'error',
            description: `规则 "${newRule.ruleName}" 与规则 "${existingRule.ruleName}" 在相似条件下执行了相互冲突的动作`,
            conflictingRules: [newRule.ruleId, existingRule.ruleId],
            suggestion: '请调整其中一个规则的触发条件或响应动作'
          });
        }
        
        // 检查是否会导致用户体验问题（如短时间内多次弹窗）
        if (newRule.responseAction.actionType === existingRule.responseAction.actionType && 
            newRule.responseAction.actionType === 'POPUP') {
          conflicts.push({
            type: 'overlap',
            severity: 'warning',
            description: `规则 "${newRule.ruleName}" 与规则 "${existingRule.ruleName}" 可能在短时间内触发多个弹窗`,
            conflictingRules: [newRule.ruleId, existingRule.ruleId],
            suggestion: '考虑添加防重复触发机制或调整触发间隔'
          });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * 检测优先级问题
   */
  private detectPriorityIssues(newRule: OverrideRule, existingRules: OverrideRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    // 检查相同优先级的规则
    const samePriorityRules = existingRules.filter(
      rule => rule.isEnabled && rule.priority === newRule.priority
    );
    
    if (samePriorityRules.length > 0) {
      conflicts.push({
        type: 'priority',
        severity: 'warning',
        description: `存在相同优先级（${newRule.priority}）的规则，执行顺序可能不确定`,
        conflictingRules: [newRule.ruleId, ...samePriorityRules.map(r => r.ruleId)],
        suggestion: '建议为每个规则设置不同的优先级以确保执行顺序'
      });
    }
    
    // 检查优先级逻辑是否合理
    const higherPriorityRules = existingRules.filter(
      rule => rule.isEnabled && rule.priority > newRule.priority
    );
    
    for (const higherRule of higherPriorityRules) {
      const overlapScore = this.calculateConditionOverlap(
        newRule.triggerConditions,
        higherRule.triggerConditions
      );
      
      if (overlapScore > 0.7) {
        conflicts.push({
          type: 'priority',
          severity: 'info',
          description: `规则 "${newRule.ruleName}" 的触发条件与更高优先级的规则 "${higherRule.ruleName}" 重叠，可能不会被执行`,
          conflictingRules: [newRule.ruleId, higherRule.ruleId],
          suggestion: '考虑提高此规则的优先级或调整触发条件'
        });
      }
    }
    
    return conflicts;
  }

  /**
   * 检测冗余规则
   */
  private detectRedundancy(newRule: OverrideRule, existingRules: OverrideRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    for (const existingRule of existingRules) {
      if (!existingRule.isEnabled) continue;
      
      // 检查是否完全重复
      if (this.isRuleDuplicate(newRule, existingRule)) {
        conflicts.push({
          type: 'redundancy',
          severity: 'error',
          description: `规则 "${newRule.ruleName}" 与现有规则 "${existingRule.ruleName}" 完全重复`,
          conflictingRules: [newRule.ruleId, existingRule.ruleId],
          suggestion: '请删除重复规则或修改其中一个规则的配置'
        });
      }
    }
    
    return conflicts;
  }

  /**
   * 检测性能影响
   */
  private detectPerformanceIssues(newRule: OverrideRule, existingRules: OverrideRule[]): RuleConflict[] {
    const conflicts: RuleConflict[] = [];
    
    const enabledRules = existingRules.filter(rule => rule.isEnabled);
    const totalRules = enabledRules.length + 1; // +1 for the new rule
    
    // 检查规则总数
    if (totalRules > 20) {
      conflicts.push({
        type: 'performance',
        severity: 'warning',
        description: `当前场景已有 ${enabledRules.length} 个启用规则，添加新规则可能影响性能`,
        conflictingRules: [newRule.ruleId],
        suggestion: '考虑禁用不常用的规则或优化规则逻辑'
      });
    }
    
    // 检查复杂条件
    const totalConditions = this.countTotalConditions(newRule.triggerConditions);
    if (totalConditions > 10) {
      conflicts.push({
        type: 'performance',
        severity: 'info',
        description: `规则 "${newRule.ruleName}" 包含 ${totalConditions} 个触发条件，可能影响执行性能`,
        conflictingRules: [newRule.ruleId],
        suggestion: '考虑简化条件逻辑或拆分为多个规则'
      });
    }
    
    return conflicts;
  }

  /**
   * 计算条件重叠度
   */
  private calculateConditionOverlap(conditions1: TriggerConditions, conditions2: TriggerConditions): number {
    const allConditions1 = [
      ...conditions1.eventConditions,
      ...conditions1.sessionConditions,
      ...conditions1.userConditions
    ];
    
    const allConditions2 = [
      ...conditions2.eventConditions,
      ...conditions2.sessionConditions,
      ...conditions2.userConditions
    ];
    
    if (allConditions1.length === 0 || allConditions2.length === 0) {
      return 0;
    }
    
    let matchCount = 0;
    const totalConditions = Math.max(allConditions1.length, allConditions2.length);
    
    for (const condition1 of allConditions1) {
      for (const condition2 of allConditions2) {
        if (this.areConditionsSimilar(condition1, condition2)) {
          matchCount++;
          break;
        }
      }
    }
    
    return matchCount / totalConditions;
  }

  /**
   * 检查两个条件是否相似
   */
  private areConditionsSimilar(condition1: TriggerCondition, condition2: TriggerCondition): boolean {
    return condition1.field === condition2.field && 
           condition1.operator === condition2.operator &&
           JSON.stringify(condition1.value) === JSON.stringify(condition2.value);
  }

  /**
   * 检查动作是否相互冲突
   */
  private checkActionContradiction(action1: any, action2: any): boolean {
    // 如果都是弹窗类型但内容完全不同，可能造成用户困惑
    if (action1.actionType === 'POPUP' && action2.actionType === 'POPUP') {
      return action1.content?.title !== action2.content?.title;
    }
    
    // 其他类型的冲突检测逻辑可以在这里扩展
    return false;
  }

  /**
   * 检查是否为重复规则
   */
  private isRuleDuplicate(rule1: OverrideRule, rule2: OverrideRule): boolean {
    return this.calculateConditionOverlap(rule1.triggerConditions, rule2.triggerConditions) > 0.95 &&
           JSON.stringify(rule1.responseAction) === JSON.stringify(rule2.responseAction);
  }

  /**
   * 统计总条件数
   */
  private countTotalConditions(conditions: TriggerConditions): number {
    return conditions.eventConditions.length + 
           conditions.sessionConditions.length + 
           conditions.userConditions.length;
  }

  /**
   * 计算风险评分
   */
  private calculateRiskScore(conflicts: RuleConflict[]): number {
    let score = 0;
    
    for (const conflict of conflicts) {
      switch (conflict.severity) {
        case 'error':
          score += 30;
          break;
        case 'warning':
          score += 15;
          break;
        case 'info':
          score += 5;
          break;
      }
    }
    
    return Math.min(score, 100);
  }

  /**
   * 获取冲突解决建议
   */
  getResolutionSuggestions(conflicts: RuleConflict[]): string[] {
    const suggestions = new Set<string>();
    
    for (const conflict of conflicts) {
      if (conflict.suggestion) {
        suggestions.add(conflict.suggestion);
      }
    }
    
    // 添加通用建议
    if (conflicts.some(c => c.type === 'overlap')) {
      suggestions.add('定期审查和整理规则，删除不必要的重复规则');
    }
    
    if (conflicts.some(c => c.type === 'priority')) {
      suggestions.add('建立清晰的规则优先级体系，确保重要规则优先执行');
    }
    
    if (conflicts.some(c => c.type === 'performance')) {
      suggestions.add('监控规则执行性能，及时优化复杂规则');
    }
    
    return Array.from(suggestions);
  }
}
