import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { TenantService } from 'service/tenant.service';
import { CreateTenantDto, UpdateTenantDto } from '../dto/tenant.dto';

@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    async createTenant(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantService.createTenant(createTenantDto);
    }

    @Get()
    async getAllTenants(@Query('search') search?: string) {
        return this.tenantService.getAllTenants();
    }

    @Get(':id')
    async getTenantById(@Param('id', ParseUUIDPipe) id: string) {
        return this.tenantService.getTenantById(id);
    }

    @Put(':id')
    async updateTenant(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTenantDto: UpdateTenantDto,
    ) {
        return this.tenantService.updateTenant(id, updateTenantDto);
    }

    @Delete(':id')
    async deleteTenant(@Param('id', ParseUUIDPipe) id: string) {
        return this.tenantService.deleteTenant(id);
    }
}