import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Audience } from '../../../../common/models/summary.model';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-audience-selector',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonToggleModule],
  templateUrl: './audience-selector.component.html',
  styleUrls: ['./audience-selector.component.css']
})
export class AudienceSelectorComponent {
  @Input() selectedAudience: Audience = 'leadership';
  @Output() audienceChange = new EventEmitter<Audience>();

  onAudienceChange(audience: Audience): void {
    this.audienceChange.emit(audience);
  }
}