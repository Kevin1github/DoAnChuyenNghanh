import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfile } from '../../../services/profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = false;
  isSaving = false;
  isUploadingAvatar = false;
  avatarPreview: string | null = null;
  selectedFile: File | null = null;
  defaultAvatarUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OTYgNTEyIj48cGF0aCBkPSJNMjQ4IDhDMTExIDggMCAxMTkgMCAyNTZzMTExIDI0OCAyNDggMjQ4IDI0OC0xMTEgMjQ4LTI0OFMzODUgOCAyNDggOHptMCA5NmM0OC42IDAgODggMzkuNCA4OCA4OHMtMzkuNCA4OC04OCA4OC04OC0zOS40LTg4LTg4IDM5LjQtODggODgtODh6bTAgMzQ0Yy01OC43IDAtMTExLjMtMjYuNi0xNDYuNS02OC4yIDE4LjgtMzUuNCAxNTUuMy01OS4yIDE0Ni41LTU2LjUgMjQuMiA3MyAxMjIuNCAxMDUuNyAyMDMuNCAxMzIuNkMzNDQgNDIxLjkgMjk5IDQ0OCAyNDggNDQ4eiIgZmlsbD0iIzAwN2JmZiIvPjwvc3ZnPg==';
  private cachedAvatarUrl: string | null = null;

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);

  constructor() {}

  ngOnInit(): void {
    this.initForm();
    this.loadUserProfile();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: ['', [Validators.required, Validators.email]],
      fullName: [''],
      phone: [''],
      address: ['']
    });
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.updateFormValues(profile);
        if (profile.hasAvatar) {
          // Cache the avatar URL when profile is loaded
          this.cachedAvatarUrl = this.profileService.getAvatarUrl();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.toastr.error('Không thể tải thông tin hồ sơ');
        this.isLoading = false;
      }
    });
  }

  updateFormValues(profile: UserProfile): void {
    if (!profile) return;
    
    this.profileForm.patchValue({
      username: profile.username || '',
      email: profile.email || '',
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      address: profile.address || ''
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Vui lòng chọn một hình ảnh');
      return;
    }

    this.isUploadingAvatar = true;
    this.profileService.uploadAvatar(this.selectedFile).subscribe({
      next: () => {
        this.toastr.success('Cập nhật avatar thành công');
        this.isUploadingAvatar = false;
        // Reset the file input and update cached avatar URL
        this.selectedFile = null;
        this.cachedAvatarUrl = this.profileService.getAvatarUrl();
      },
      error: (error) => {
        console.error('Failed to upload avatar:', error);
        this.toastr.error('Không thể tải lên avatar');
        this.isUploadingAvatar = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.toastr.warning('Vui lòng kiểm tra các trường dữ liệu');
      return;
    }

    this.isSaving = true;
    const formData = {
      fullName: this.profileForm.get('fullName')?.value,
      phone: this.profileForm.get('phone')?.value,
      address: this.profileForm.get('address')?.value,
      email: this.profileForm.get('email')?.value
    };
    
    this.profileService.updateProfile(formData).subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.toastr.success('Cập nhật hồ sơ thành công');
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.toastr.error('Không thể cập nhật hồ sơ');
        this.isSaving = false;
      }
    });
  }

  getAvatarUrl(): string {
    // If we have a preview from a file being uploaded, use that
    if (this.avatarPreview) {
      return this.avatarPreview;
    }
    
    // If user has an avatar, try to fetch it
    if (this.userProfile?.hasAvatar) {
      try {
        if (!this.cachedAvatarUrl) {
          // Generate a fresh URL if we don't have a cached one
          this.cachedAvatarUrl = this.profileService.getAvatarUrl();
          console.log('Generated avatar URL:', this.cachedAvatarUrl);
        }
        return this.cachedAvatarUrl;
      } catch (error) {
        console.error('Error getting avatar URL:', error);
        return this.defaultAvatarUrl;
      }
    }
    
    // Default fallback avatar
    return this.defaultAvatarUrl;
  }

  // Add a method to handle avatar loading errors
  onAvatarError(event: Event): void {
    console.error('Avatar image failed to load');
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultAvatarUrl;
  }
} 