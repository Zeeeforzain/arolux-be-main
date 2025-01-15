import { Router } from 'express';
import { getUploadFileSignedUrl } from '../../controllers/common/common.controller.js';

import { overallAuth } from '../../middlewares/common/auth.middleware.js';

const commonRouter = Router();

commonRouter.get('/file', overallAuth, getUploadFileSignedUrl);

export default commonRouter;
