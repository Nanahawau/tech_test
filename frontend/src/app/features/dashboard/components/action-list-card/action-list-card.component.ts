import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActionList } from '../../../../common/models/summary.model';

@Component({
  selector: 'app-action-list-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './action-list-card.component.html',
  styleUrls: ['./action-list-card.component.css']
})
export class ActionListCardComponent {
  @Input() title = '';
  @Input() actionList: ActionList | null = null;
  @Input() iconName = 'warning';
  @Input() iconColor = 'text-orange-600';
  
  isExpanded = true; // Expanded by default

  constructor(private router: Router) {}

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  viewAccount(accountUuid: string): void {
    this.router.navigate(['/accounts'], { 
      queryParams: { account_uuid: accountUuid } 
    });
  }

  get itemCount(): number {
    return this.actionList?.items?.length || 0;
  }

  get hasItems(): boolean {
    return this.itemCount > 0;
  }
}