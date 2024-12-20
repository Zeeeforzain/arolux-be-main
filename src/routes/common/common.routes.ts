import { Router } from 'express';
import { getUploadFileSignedUrl } from '../../controllers/common/common.controller.js';

import { commonAuth } from '../../middlewares/common/auth.middleware.js';

const commonRouter = Router();

commonRouter.get('/file', commonAuth, getUploadFileSignedUrl);

export default commonRouter;
