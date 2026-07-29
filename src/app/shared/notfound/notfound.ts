import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './notfound.html'
})
export class NotFound {}
