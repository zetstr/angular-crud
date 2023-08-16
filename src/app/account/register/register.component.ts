import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isSubmit = false;
  showAlert = false;
  isExisting = false;
  isSuccess = false;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  registerSubmit() {
    this.isSubmit = true;

    if (this.registerForm.invalid) {
      return;
    }
    const data = this.registerForm.value;
    console.log(data)

    this.userService.add(data.username, data.password, data.firstName, data.lastName).subscribe((data) => {
      console.log("Create success", data);
      this.showAlert = true;
      this.isExisting = false;
      this.isSuccess = true;
      this.isSubmit = false;
      this.registerForm.reset();
    })
  }

  login() {
    this.router.navigate(['/account/login'])
  }
}
