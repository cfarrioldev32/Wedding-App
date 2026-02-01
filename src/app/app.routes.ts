import { Routes } from '@angular/router';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { InvitationPageComponent } from './components/invitation/invitation-page.component';

export const routes: Routes = [
    {
        path: 'register',
        component: RegisterFormComponent
    },
    {
        path: 'stepper',
        component: StepperComponent
    },
    {
        path: 'invitation',
        component: InvitationPageComponent
    }
];
