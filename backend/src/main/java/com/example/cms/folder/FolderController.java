package com.example.cms.folder;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class FolderController {
    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @GetMapping("/admin/folders/tree")
    public List<FolderDto> getAdminTree() {
        return folderService.getAdminTree();
    }

    @GetMapping("/public/folders/tree")
    public List<FolderDto> getPublicTree() {
        return folderService.getPublicTree();
    }

    @PostMapping("/admin/folders")
    @ResponseStatus(HttpStatus.CREATED)
    public FolderDto create(@Valid @RequestBody CreateFolderRequest request) {
        return folderService.create(request);
    }

    @DeleteMapping("/admin/folders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        folderService.delete(id);
    }
}
