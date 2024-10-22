import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder, FolderDocument } from './schemas/folder.schema';
import { CreateFolderDto } from './dto/create-folder.dto';
import { plainToInstance } from 'class-transformer';
import { FolderPreviewDto } from './dto/folder-preview.dto';

@Injectable()
export class FoldersService {
  @Inject()
  private readonly logger: Logger;

  @InjectModel(Folder.name)
  private readonly folderModel: Model<FolderDocument>;

  async create({
    folderName,
    parentDirID,
  }: CreateFolderDto): Promise<FolderPreviewDto> {
    if (parentDirID) {
      const parentFolder = await this.folderModel.findById(parentDirID);
      if (!parentFolder) {
        throw new NotFoundException(
          `Parent dir with ID ${parentDirID} not found`,
        );
      }
    }

    const folder = await this.folderModel.findOne({
      folderName: folderName,
      ...(parentDirID ? { parentDirID } : {}),
    });
    if (folder) {
      throw new BadRequestException(
        `Folder with this name ${folderName} already exist in ${parentDirID ? `this parent dir(${parentDirID})` : 'root folder'}`,
      );
    }

    this.logger.debug(
      `Saving folder to db: ${JSON.stringify({
        folderName,
        parentDirID,
      })}`,
    );

    const createdFolder = await this.folderModel.create({
      folderName,
      parentDirID,
    });
    return plainToInstance(FolderPreviewDto, createdFolder, {
      excludeExtraneousValues: true,
    });
  }
}
