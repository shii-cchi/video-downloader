import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderPreviewDto } from './dto/folder-preview.dto';

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
}
