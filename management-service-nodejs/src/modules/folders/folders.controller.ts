import {
  Body,
  Controller,
  Delete,
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

@Controller('folders')
@UsePipes(new ValidationPipe())
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
    @Param('id') id: string,
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
  async delete(@Param('id') id: string) {
    this.logger.debug(
      `Deleting folder request has been received for folder ${id}`,
    );

    await this.foldersService.delete(id);
    this.logger.log(`Folder has been successfully deleted: ${id}`);
  }
}
