import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderPreviewDto } from './dto/folder-preview.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ContentPreviewDto } from './dto/content-preview.dto';
import { ObjectIdDto } from '../../lib/dto/object-id.dto';

@Controller('folders')
@UsePipes(new ValidationPipe({ transform: true, stopAtFirstError: true }))
export class FoldersController {
  @Inject()
  private readonly logger: Logger;

  @Inject()
  private readonly foldersService: FoldersService;

  @Post('/')
  async create(
    @Body() createFolderDto: CreateFolderDto,
  ): Promise<FolderPreviewDto> {
    this.logger.debug(
      `Creating folder request has been received with body: ${JSON.stringify(createFolderDto)}`,
    );

    const newFolder = await this.foldersService.create(createFolderDto);
    this.logger.log(
      `Folder has been successfully created: ${JSON.stringify(newFolder)}`,
    );
    return newFolder;
  }

  @Put('/:id')
  async update(
    @Body() updateFolderDto: UpdateFolderDto,
    @Param() { id }: ObjectIdDto,
  ): Promise<FolderPreviewDto> {
    this.logger.debug(
      `Updating folder request has been received with body: ${JSON.stringify(updateFolderDto)} and for folder ${id}`,
    );

    const updatedFolder = await this.foldersService.update(updateFolderDto, id);
    this.logger.log(
      `Folder has been successfully updated: ${JSON.stringify(updatedFolder)}`,
    );
    return updatedFolder;
  }

  @Delete('/:id')
  async delete(@Param() { id }: ObjectIdDto): Promise<void> {
    this.logger.debug(
      `Deleting folder request has been received for folder ${id}`,
    );

    await this.foldersService.delete(id);
    this.logger.log(`Folder with id: ${id} has been successfully deleted`);
  }

  @Get('/:id?')
  async get(@Param() { id }: ObjectIdDto): Promise<ContentPreviewDto> {
    this.logger.debug(
      `Getting folder request has been received for ${id ? `${id}`: 'root'} folder`,
    );

    const content = await this.foldersService.get(id);
    this.logger.log(`Content has been received for ${id ? `${id}`: 'root'} folder`);

    return content;
  }
}
