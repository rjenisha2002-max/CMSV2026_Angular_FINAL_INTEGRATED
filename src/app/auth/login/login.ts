import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm!: FormGroup;
  isSubmitted = false;
  isLoading = false;
  errorMessage = '';

  constructor(private formBuilder: FormBuilder, private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  submit(): void {
    this.isSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter username and password.';
      return;
    }

    this.isLoading = true;
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigateByUrl(this.authService.dashboardRouteForRole(res.roleName));
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message ?? 'Invalid username or password.';
      }
    });
  }
}
