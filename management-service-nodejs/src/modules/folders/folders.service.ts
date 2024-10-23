import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Folder, FolderDocument } from './schemas/folder.schema';
import { CreateFolderDto } from './dto/create-folder.dto';
import { plainToInstance } from 'class-transformer';
import { FolderPreviewDto } from './dto/folder-preview.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { ContentPreviewDto } from './dto/content-preview.dto';

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

  async update(
    { folderName, parentDirID }: UpdateFolderDto,
    id: Types.ObjectId,
  ) {
    if (parentDirID) {
      const parentFolder = await this.folderModel.findById(parentDirID);
      if (!parentFolder) {
        throw new NotFoundException(
          `Parent dir with ID ${parentDirID} not found`,
        );
      }
    }

    if (folderName) {
      const currentParent = await this.folderModel
        .findById(id)
        .select('parentDirID');

      const currentParentID = currentParent?.parentDirID;

      const folder = await this.folderModel.findOne({
        folderName,
        parentDirID: currentParentID,
        _id: { $ne: id },
      });
      if (folder) {
        throw new BadRequestException(
          `Folder with this name ${folderName} already exist in ${parentDirID ? `this parent dir(${parentDirID})` : 'root folder'}`,
        );
      }
    }

    this.logger.debug(
      `Updating folder to db: ${JSON.stringify({
        ...(folderName ? { folderName } : {}),
        ...(parentDirID ? { parentDirID } : {}),
      })}`,
    );

    const updatedFolder = await this.folderModel.findByIdAndUpdate(
      id,
      {
        ...(folderName ? { folderName } : {}),
        ...(parentDirID ? { parentDirID } : {}),
      },
      { new: true },
    );

    if (!updatedFolder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    return plainToInstance(FolderPreviewDto, updatedFolder, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: Types.ObjectId) {
    const folder = await this.folderModel.findById(id);
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    const pipeline = [
      {
        $match: { parentDirID: id },
      },
      {
        $graphLookup: {
          from: 'folders',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parentDirID',
          as: 'nestedFolders',
        },
      },
      {
        $project: {
          allFolderIds: {
            $setUnion: [
              [{ $toObjectId: '$_id' }],
              {
                $map: {
                  input: '$nestedFolders',
                  as: 'folder',
                  in: '$$folder._id',
                },
              },
            ],
          },
        },
      },
      {
        $unwind: {
          path: '$allFolderIds',
        },
      },
      {
        $project: {
          _id: '$allFolderIds',
        },
      },
    ];

    const nestedFoldersID = await this.folderModel.aggregate(pipeline).exec();
    const arrNestedFolderID = nestedFoldersID.map((item) => item._id);
    await this.folderModel.deleteMany({
      _id: { $in: arrNestedFolderID },
    });
    this.logger.debug(`Deleting nested folders from db: ${arrNestedFolderID}`);

    // get all nested videos and delete these

    this.logger.debug(`Deleting folder from db: ${id}`);
    await this.folderModel.findByIdAndDelete(id);
  }

  async get(id: Types.ObjectId): Promise<ContentPreviewDto> {
    const folder = await this.folderModel.findById(id);
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    this.logger.debug(`Getting folder content from db: ${id}`);
    const subFolders = await this.folderModel.find({ parentDirID: id }).lean();
    const subFoldersDto = plainToInstance(FolderPreviewDto, subFolders, {
      excludeExtraneousValues: true,
    });

    // get videos

    return { videos: [], folders: subFoldersDto };
  }
}
