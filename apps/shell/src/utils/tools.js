    const compressImageFile = async (file, options = {}) => {
        const {
        maxWidth = 640,
        maxHeight = 640,
        quality = 0.7,
        type = 'image/jpeg'
        } = options;

        return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 创建临时URL
        const tempUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // 立即清理临时URL
            URL.revokeObjectURL(tempUrl);
            
            canvas.toBlob(
            (blob) => {
                if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
                }
                
                const compressedFile = new File([blob], file.name, {
                type: type,
                lastModified: Date.now()
                });
                
                console.log(`图片压缩: ${file.name}`, {
                原始大小: `${(file.size / 1024).toFixed(1)}KB`,
                压缩大小: `${(blob.size / 1024).toFixed(1)}KB`,
                压缩比例: `${(blob.size / file.size * 100).toFixed(1)}%`
                });
                
                resolve(compressedFile);
            },
            type,
            quality
            );
        };
        
        img.onerror = () => {
            // 清理临时URL
            URL.revokeObjectURL(tempUrl);
            reject(new Error('图片加载失败'));
        };
        
        img.src = tempUrl;
        });
    }

    const fileToStorable = async (file) => {
    if (file.type.startsWith('image/')) {
        // 为图片文件生成缩略图（进一步压缩用于存储）
        const thumbnailData = await createOptimizedImageData(file);
        return {
        name: file.name,
        type: file.type,
        size: file.size,
        data: thumbnailData, // 保存高度压缩的缩略图
        isLargeFile: file.size > 1024 * 1024,
        lastModified: file.lastModified,
        _isMobileOptimized: true,
        _isCompressed: true
        };
    }
    
    // 非图片文件保持原有逻辑
    if (file.size > 1024 * 1024) {
        return {
        name: file.name,
        type: file.type,
        size: file.size,
        data: null,
        isLargeFile: true,
        lastModified: file.lastModified,
        _isMobileOptimized: true
        };
    }
    
        return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
            }),
            isLargeFile: false,
            lastModified: file.lastModified,
            _isMobileOptimized: false
        };
    };

    const createOptimizedImageData = (file) => {
        return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 创建临时URL
        const tempUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            const maxWidth = 400;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // 立即清理临时URL
            URL.revokeObjectURL(tempUrl);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
            resolve(dataUrl);
        };
        
        img.onerror = () => {
            // 清理临时URL
            URL.revokeObjectURL(tempUrl);
            reject(new Error('图片加载失败'));
        };
        
        img.src = tempUrl;
        });
    };


    const createFileInfo = (fileObj, createPreview = false) => {
        const baseInfo = {
            name: fileObj.name,
            size: fileObj.size,
            type: fileObj.type,
            file: fileObj,
            id: createPreview ? `preview-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` : `file-${Date.now()}`
        };
        
        if (createPreview) {
            baseInfo.previewUrl = URL.createObjectURL(fileObj);
        }
        
        return baseInfo;
    };

    const processImageFile = async (file, compressOptions, createPreview = false) => {
      const fileSizeMB = file.size / (1024 * 1024);

      // 小于1MB不压缩
      if (fileSizeMB <= 1) {
        console.log(`✅ ${file.name}: 小于1MB，不压缩`);
        return createFileInfo(file, createPreview);
      }

      // 大于等于1MB：智能压缩
      console.log(`🔄 ${file.name}: 大于等于1MB，开始压缩`);
      
      try {
        const compressedFile = await compressImageFile(file, compressOptions);
        console.log(`✅ ${file.name}: 压缩成功`);
        return createFileInfo(compressedFile, createPreview);
      } catch (err) {
        console.error(`❌ ${file.name}: 图片压缩失败:`, err);
        console.log(`⚠️ ${file.name}: 压缩失败，使用原始文件`);
        return createFileInfo(file, createPreview);
      }
    };

export {
    fileToStorable,
    processImageFile
}