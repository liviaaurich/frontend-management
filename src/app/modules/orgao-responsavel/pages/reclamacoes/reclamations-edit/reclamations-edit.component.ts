import {Component, OnInit} from '@angular/core';
import {ReclamationModel} from 'src/app/shared/models/aplicacao/reclamation.model';
import {ConfirmationService, MessageService, SelectItem} from 'primeng/api';
import {StatusReclamationEnum} from '../../../../../shared/models/aplicacao/status-reclamation.enum';
import {ActivatedRoute, Router} from '@angular/router';
import {ReclamationService} from '../../../../../shared/services/reclamation.service';
import {BlockUIService} from '../../../../../shared/services/block-ui.service';
import {finalize} from 'rxjs/operators';
import {PrimengFactory} from '../../../../../shared/factories/primeng.factory';
import {ErrorType} from '../../../../../shared/auth/model/error-type.enum';
import {MapeamentoRota} from '../../../../../shared/constants/mapeamento-rota';
import {ResponseModel} from '../../../../../shared/models/aplicacao/response.model';

@Component({
    selector: 'app-reclamations-edit',
    templateUrl: './reclamations-edit.component.html',
    styleUrls: ['./reclamations-edit.component.scss']
})
export class ReclamationsEditComponent implements OnInit {
    public id: number = null;
    public selectedReclamation: ReclamationModel = new ReclamationModel();
    public yesNoOptions: SelectItem<boolean>[] = [
        {value: true, label: 'Sim'},
        {value: false, label: 'Não'}
    ];
    public status: StatusReclamationEnum[] = StatusReclamationEnum.getAllStatus();
    public isCorrectResponsibleCompany: boolean = true;
    public isProblemReal: boolean = true;

    public modalLocalizacaoVisivel = false;
    public mapCentering: google.maps.LatLngLiteral = {lat: -19.551675, lng: -40.580482};
    public zoomMap = 15;
    public mapConfig: google.maps.MapOptions = this.initializeMapConfig();
    public mapType: google.maps.MapTypeId = google.maps.MapTypeId.ROADMAP;

    constructor(
        private confirmationService: ConfirmationService,
        private reclamationService: ReclamationService,
        private blockUIService: BlockUIService,
        private messageService: MessageService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {
        this.activatedRoute.paramMap.subscribe(params => {
            this.id = Number(params.get('id'));
        });
    }

    async ngOnInit() {
        await this.getById(this.id);
    }

    public showLocation(): void {
        this.mapCentering = {
            lat: Number(this.selectedReclamation.localization.latitude),
            lng: Number(this.selectedReclamation.localization.longitude)
        };
        this.zoomMap = 15;
        this.modalLocalizacaoVisivel = true;
    }

    save(selectedReclamation: ReclamationModel) {
        this.blockUIService.block();
        this.selectedReclamation.response.reclamationId = this.selectedReclamation.id;
        return this.reclamationService.update(selectedReclamation)
            .pipe(finalize(() => this.blockUIService.unblock()))
            .subscribe({
                next: () => this.router.navigateByUrl(MapeamentoRota.ROTA_RECLAMACOES.obterCaminhoRota()),
                error: (error) => PrimengFactory.mensagemErro(this.messageService, 'Erro ao obter os dados da reclamação.',
                    ErrorType.getMessage(error.code))
            });
    }

    cancel() {
        this.confirmationService.confirm({
            header: 'Atenção!',
            message: 'Voltar agora descartará quaisquer edições não salvas, deseja prosseguir?',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () => {
                this.selectedReclamation = null;
                this.router.navigateByUrl(MapeamentoRota.ROTA_RECLAMACOES.obterCaminhoRota());
            },
            reject: () => {
            }
        });
    }

    onOptionCorrectResponsibleCompanyChange(event: any) {
        if (event === false) {
            this.selectedReclamation.status = StatusReclamationEnum.REJECTED.getValue();
        }
    }

    onOptionRealProblemChange(event: any) {
        if (event === false) {
            this.selectedReclamation.status = StatusReclamationEnum.UNIDENTIFIED.getValue();
        }
    }

    private async getById(id: number) {
        this.blockUIService.block();
        return this.reclamationService.getById(id)
            .pipe(finalize(() => this.blockUIService.unblock()))
            .subscribe({
                next: (res) => {
                    this.selectedReclamation = res;
                    this.selectedReclamation.response = res.response ? res.response : new ResponseModel();
                    const loc = this.selectedReclamation.localization;
                    this.selectedReclamation.localization.localizationDescription = loc.street + ' - ' + loc.district + ', ' + loc.city;
                    this.defineSelectedButtonByStatus();
                },
                error: (error) => PrimengFactory.mensagemErro(this.messageService, 'Erro ao obter os dados da reclamação.',
                    ErrorType.getMessage(error.code))
            });
    }

    private initializeMapConfig(): google.maps.MapOptions {
        return {
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: true
        };
    }

    private defineSelectedButtonByStatus() {
        if (this.selectedReclamation.status === StatusReclamationEnum.REJECTED.getValue()) {
            this.isCorrectResponsibleCompany = false;
            this.isProblemReal = true;
        } else if (this.selectedReclamation.status === StatusReclamationEnum.UNIDENTIFIED.getValue()) {
            this.isCorrectResponsibleCompany = true;
            this.isProblemReal = false;
        } else {
            this.isCorrectResponsibleCompany = true;
            this.isProblemReal = true;
        }
    }
}
