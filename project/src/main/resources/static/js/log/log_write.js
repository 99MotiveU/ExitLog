
document.addEventListener('DOMContentLoaded', () => {
	// * 게시글 작성 페이지 남은 FE

	//- tags 값 수집
	const selectedTagIds = new Set();
	document.getElementById("tag-container").addEventListener("click", (e) => {
		const tagBtn = e.target.closest('.tag-component');
		if (!tagBtn) return; 
		const tagId = tagBtn.dataset.id;
		if (selectedTagIds.has(tagId)) {
            selectedTagIds.delete(tagId);
            tagBtn.classList.remove("selected");
		}else{
            selectedTagIds.add(tagId);
            tagBtn.classList.add("selected");
		}
	});

	//- 에디터 설정
	const editor = new toastui.Editor({
		el: document.querySelector('#editor'), // 에디터를 붙일 요소
		height: '600px',
		initialEditType: 'wysiwyg',
		previewStyle: 'vertical',
		toolbarItems: [
			['heading', 'bold', 'italic', 'strike'],
			['hr', 'quote'],
			['ul', 'ol', 'task'],
			['table', 'image', 'link'],
			['code', 'codeblock'],
		],
		hooks: {
			addImageBlobHook: async (blob, callback) => {
				const MAX_SIZE = 5 * 1024 * 1024;
				if (blob.size > MAX_SIZE) {
					alert('이미지 크기가 너무 큽니다(최대 5MB)');
					return;
				}
				console.log('이미지 업로드', blob);
				const formData = new FormData();
				formData.append('image', blob);

				try {
					const res = await fetch('/log/imgUpload', {
						method: "POST",
						body: formData
					});

					const imgUrl = await res.json(); // /upload/fileName.확장자 로 넘어옴
					if (!res.ok || !res.url) {
						alert('이미지 업로드 실패: ' + (result?.message || '서버 오류'));
					} else {
						callback(imgUrl.url, 'image alt');
					}
				} catch (error) {
					console.error(error);
					alert('이미지 업로드 실패: 이미지 사이즈 크기 문제/서버오류');
				}

			}
		}
	});

	//- 비동기 제출(작성, 수정)
	const form = document.getElementById("form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		//게시글 작성 비동기 통신
		const formData = new FormData(form);
		const actionUrl = form.getAttribute('action');
		const dataObj = {};
		formData.forEach((value, key) => {
	        if (key !== 'valText') {
            	dataObj[key] = value;
        	}
		});
		dataObj.valText = document.getElementById('valText').value.trim();
		dataObj.isCurrentlyEmployed = document.getElementById('employed').checked;
		dataObj.content = editor.getHTML();
		dataObj.tags = Array.from(selectedTagIds).map(Number);
		if (dataObj.content === null || dataObj.content.trim() === "") {
			alert('본문을 입력해주세요');
			return;
		}
		if (!dataObj.title || dataObj.title.trim() === "") {
			alert('제목을 입력해주세요');
			return;
		}

		try {
			const response = await fetch(actionUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(dataObj)
			});

			if (!response.ok) {
				throw new Error(`서버 오류: ${response.status}`);
			}
			const result = await response.json();
			if (result.logNo) {
				window.location.href = `/log/${result.logNo}`;
			}

		} catch (error) {
			alert("서버 통신 오류 발생" + error.message);
		}
	});

});