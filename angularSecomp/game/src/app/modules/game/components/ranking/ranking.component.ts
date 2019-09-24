import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  @Input() index: number;
  @Input() value: string;

  constructor() { }

  ngOnInit() {
  }

}
