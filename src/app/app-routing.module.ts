import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MapeamentoRota} from './shared/constants/mapeamento-rota';
import {EntrarComponent} from './pages/entrar/entrar.component';
import {AuthGuard} from './shared/auth/guard/auth-guard';
import {CompleteRegistrationComponent} from './pages/complete-registration/complete-registration.component';

const routes: Routes = [
    { path: MapeamentoRota.ROTA_RAIZ.obterRota(), redirectTo: MapeamentoRota.ROTA_AUTENTICAR.obterRota(), pathMatch: 'full' },
    { path: MapeamentoRota.ROTA_AUTENTICAR.obterRota(), component: EntrarComponent },
    { path: MapeamentoRota.ROTA_CONCLUIR_CADASTRO.obterRota(), component: CompleteRegistrationComponent },
    { path: MapeamentoRota.ROTA_PAINEL_ADMINISTRATIVO.obterRota(), loadChildren: () => import('./modules/orgao-responsavel/orgao-responsavel.module').then((m) => m.OrgaoResponsavelModule), canActivate: [AuthGuard] },
    { path: MapeamentoRota.ROTA_PAINEL_ADMINISTRATIVO_SYSTEM_ADMIN.obterRota(), loadChildren: () => import('./modules/system-admin/system-admin.module').then((m) => m.SystemAdminModule), canActivate: [AuthGuard] },
    { path: '**', redirectTo: MapeamentoRota.ROTA_RAIZ.obterRota() },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
