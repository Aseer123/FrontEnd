import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserSignUpPageComponent } from './user-sign-up-page/user-sign-up-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ResidentDashboardComponent } from './resident-dashboard/resident-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';


const routes: Routes = [
  { path: 'signup', component: UserSignUpPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'resident', component: ResidentDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
